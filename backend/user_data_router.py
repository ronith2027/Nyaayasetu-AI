import os
from datetime import datetime
from typing import Optional, Any

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends, Query, Path
from pydantic import BaseModel
from mysql.connector import pooling, Error as MySQLError
import jwt

load_dotenv()

router = APIRouter(prefix="/user-data", tags=["user-data"])


# --- Auth dependency (decode JWT like middleware/auth.ts) ---

JWT_SECRET = os.getenv("JWT_SECRET", "fallback-secret")


class AuthedUser(BaseModel):
    userId: int
    email: str


def get_current_user(authorization: str = Depends(lambda: "")) -> AuthedUser:
    # This small helper expects the raw "Authorization" header passed via FastAPI dependency override
    # In main.py we'll wire a dependency that forwards request.headers.get("authorization", "")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token required")
    token = authorization.split(" ")[1]
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    return AuthedUser(userId=int(decoded.get("userId")), email=str(decoded.get("email")))


# --- DB setup (pool + memory fallback) ---

user_db_pool: Optional[pooling.MySQLConnectionPool] = None
use_memory_db: bool = False
memory_user_data: list[dict[str, Any]] = []

try:
    user_db_pool = pooling.MySQLConnectionPool(
        pool_name="user_data_pool",
        pool_size=5,
        host=os.getenv("USER_DATA_DB_HOST", "localhost"),
        user=os.getenv("USER_DATA_DB_USER", "root"),
        password=os.getenv("USER_DATA_DB_PASSWORD", ""),
        database=os.getenv("USER_DATA_DB_NAME", "nyaaya_user_data"),
        charset="utf8mb4",
        autocommit=True,
    )
except MySQLError as e:  # pragma: no cover
    print("Failed to create user data pool, using memory mode:", e)
    use_memory_db = True


def init_misc_table() -> None:
    """Create misc_user_data as a generic catch-all table (split by feature is documented in DATABASE_SCHEMA)."""
    global use_memory_db
    if not user_db_pool:
        use_memory_db = True
        return
    try:
        conn = user_db_pool.get_connection()
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS misc_user_data (
              id INT AUTO_INCREMENT PRIMARY KEY,
              email VARCHAR(255) NOT NULL,
              data_type VARCHAR(50) NOT NULL,
              data JSON NOT NULL,
              state VARCHAR(100),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_email (email),
              INDEX idx_data_type (data_type),
              INDEX idx_state (state)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """
        )
        conn.commit()
        cur.close()
        conn.close()
        print("User data (misc_user_data) table initialized")
    except MySQLError as e:  # pragma: no cover
        print("Error initializing user data database, switching to memory mode:", e)
        use_memory_db = True


init_misc_table()


# --- Models ---

class SaveUserDataRequest(BaseModel):
    data_type: str
    data: Any
    state: Optional[str] = None


class UpdateUserDataRequest(BaseModel):
    data: Any
    state: Optional[str] = None


# --- Endpoints ---

@router.post("/save")
def save_user_data(
    body: SaveUserDataRequest,
    current_user: AuthedUser = Depends(get_current_user),
):
    if not isinstance(body.data, (dict, list)):
        raise HTTPException(
            status_code=400,
            detail="data must be a valid JSON object or array",
        )

    if use_memory_db:
        record_id = int(datetime.utcnow().timestamp() * 1000)
        record = {
            "id": record_id,
            "email": current_user.email,
            "data_type": body.data_type,
            "data": body.data,
            "state": body.state,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        memory_user_data.append(record)
        return {"message": "User data saved (Memory mode)", **record}

    try:
        conn = user_db_pool.get_connection()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO misc_user_data (email, data_type, data, state)
            VALUES (%s, %s, %s, %s)
            """,
            (current_user.email, body.data_type, json_dumps(body.data), body.state),
        )
        conn.commit()
        record_id = cur.lastrowid
        cur.close()
        conn.close()
    except MySQLError as e:  # pragma: no cover
        print("Save user data error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

    return {
        "message": "User data saved successfully",
        "id": record_id,
        "email": current_user.email,
        "data_type": body.data_type,
        "state": body.state,
    }


def json_dumps(value: Any) -> str:
    import json

    return json.dumps(value, ensure_ascii=False)


@router.get("/{user_id}")
def get_user_data(
    user_id: int = Path(...),
    data_type: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: AuthedUser = Depends(get_current_user),
):
    # Users can only access their own data (keep same contract as Node version)
    if user_id != current_user.userId:
        raise HTTPException(status_code=403, detail="Access denied")

    if use_memory_db:
        filtered = [r for r in memory_user_data if r["email"] == current_user.email]
        if data_type:
            filtered = [r for r in filtered if r["data_type"] == data_type]
        if state:
            filtered = [r for r in filtered if r["state"] == state]
        sorted_records = sorted(
            filtered, key=lambda r: r["created_at"], reverse=True
        )
        paginated = sorted_records[offset : offset + limit]
        return {"user_data": paginated, "total": len(paginated)}

    try:
        conn = user_db_pool.get_connection()
        cur = conn.cursor(dictionary=True)
        query = "SELECT * FROM misc_user_data WHERE email = %s"
        params: list[Any] = [current_user.email]
        if data_type:
            query += " AND data_type = %s"
            params.append(data_type)
        if state:
            query += " AND state = %s"
            params.append(state)
        query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        cur.close()
        conn.close()
    except MySQLError as e:  # pragma: no cover
        print("Get user data error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

    # MySQL JSON comes back as str in some drivers; parse defensively
    import json

    parsed_rows = []
    for r in rows:
        data_val = r.get("data")
        if isinstance(data_val, str):
            try:
                r["data"] = json.loads(data_val)
            except Exception:
                pass
        parsed_rows.append(r)

    return {"user_data": parsed_rows, "total": len(parsed_rows)}


@router.put("/update/{record_id}")
def update_user_data(
    record_id: int,
    body: UpdateUserDataRequest,
    current_user: AuthedUser = Depends(get_current_user),
):
    if body.data is None:
        raise HTTPException(status_code=400, detail="data is required")

    if use_memory_db:
        for r in memory_user_data:
            if r["id"] == record_id and r["email"] == current_user.email:
                r["data"] = body.data
                if body.state is not None:
                    r["state"] = body.state
                r["updated_at"] = datetime.utcnow().isoformat()
                return {"message": "User data updated (Memory mode)", "id": record_id}
        raise HTTPException(status_code=404, detail="Record not found")

    try:
        conn = user_db_pool.get_connection()
        cur = conn.cursor()

        # Ensure record belongs to this user
        cur.execute(
            "SELECT id FROM misc_user_data WHERE id = %s AND email = %s",
            (record_id, current_user.email),
        )
        existing = cur.fetchone()
        if not existing:
            cur.close()
            conn.close()
            raise HTTPException(
                status_code=404, detail="Record not found or access denied"
            )

        fields = ["data = %s", "updated_at = CURRENT_TIMESTAMP"]
        params: list[Any] = [json_dumps(body.data)]
        if body.state is not None:
            fields.append("state = %s")
            params.append(body.state)
        params.append(record_id)
        params.append(current_user.email)

        cur.execute(
            f"UPDATE misc_user_data SET {', '.join(fields)} WHERE id = %s AND email = %s",
            tuple(params),
        )
        conn.commit()
        cur.close()
        conn.close()
    except MySQLError as e:  # pragma: no cover
        print("Update user data error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

    return {"message": "User data updated successfully", "id": record_id}


@router.delete("/delete/{record_id}")
def delete_user_data(
    record_id: int,
    current_user: AuthedUser = Depends(get_current_user),
):
    if use_memory_db:
        for idx, r in enumerate(memory_user_data):
            if r["id"] == record_id and r["email"] == current_user.email:
                memory_user_data.pop(idx)
                return {"message": "User data deleted (Memory mode)", "id": record_id}
        raise HTTPException(status_code=404, detail="Record not found")

    try:
        conn = user_db_pool.get_connection()
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM misc_user_data WHERE id = %s AND email = %s",
            (record_id, current_user.email),
        )
        affected = cur.rowcount
        conn.commit()
        cur.close()
        conn.close()
    except MySQLError as e:  # pragma: no cover
        print("Delete user data error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

    if affected == 0:
        raise HTTPException(status_code=404, detail="Record not found or access denied")

    return {"message": "User data deleted successfully", "id": record_id}


@router.get("/summary/{user_id}")
def summary_user_data(
    user_id: int,
    current_user: AuthedUser = Depends(get_current_user),
):
    if user_id != current_user.userId:
        raise HTTPException(status_code=403, detail="Access denied")

    if use_memory_db:
        summary_map: dict[tuple[str, Optional[str]], dict[str, Any]] = {}
        for r in memory_user_data:
            if r["email"] != current_user.email:
                continue
            key = (r["data_type"], r.get("state"))
            if key not in summary_map:
                summary_map[key] = {
                    "data_type": r["data_type"],
                    "state": r.get("state"),
                    "count": 0,
                    "last_updated": r["updated_at"],
                }
            item = summary_map[key]
            item["count"] += 1
            if r["updated_at"] > item["last_updated"]:
                item["last_updated"] = r["updated_at"]
        return {"summary": list(summary_map.values()), "user_id": user_id}

    try:
        conn = user_db_pool.get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute(
            """
            SELECT 
              data_type,
              state,
              COUNT(*) AS count,
              MAX(created_at) AS last_updated
            FROM misc_user_data
            WHERE email = %s
            GROUP BY data_type, state
            ORDER BY count DESC
            """,
            (current_user.email,),
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
    except MySQLError as e:  # pragma: no cover
        print("Get summary error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

    return {"summary": rows, "user_id": user_id}

