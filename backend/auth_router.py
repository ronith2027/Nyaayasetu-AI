import os
import logging
from datetime import datetime, timedelta
from typing import Optional

try:
    import bcrypt
except ImportError:  # pragma: no cover
    bcrypt = None
    import hashlib
    def _fallback_hash(password: str) -> str:
        return hashlib.sha256(password.encode('utf-8')).hexdigest()
    def _fallback_check(password: str, hashed: str) -> bool:
        return hashlib.sha256(password.encode('utf-8')).hexdigest() == hashed
import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from mysql.connector import pooling, Error as MySQLError
from .services.dynamodb_service import (
    DYNAMODB_TABLE_USERS,
    get_item as dynamo_get_item,
    put_item as dynamo_put_item,
    DynamoDBServiceError,
)

# Configure logger for this module
logger = logging.getLogger("auth_router")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
if not logger.handlers:
    logger.addHandler(handler)

load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])

# --- DB setup (pool + memory fallback + optional DynamoDB mode) ---

AUTH_USE_DYNAMODB: bool = os.getenv("AUTH_USE_DYNAMODB", "0") == "1"

auth_db_pool: Optional[pooling.MySQLConnectionPool] = None
use_memory_db: bool = False
memory_users: dict[str, dict] = {}  # email -> {user_id, email, hashed_password}

if not AUTH_USE_DYNAMODB:
    try:
        auth_db_pool = pooling.MySQLConnectionPool(
            pool_name="auth_pool",
            pool_size=5,
            host=os.getenv("AUTH_DB_HOST", "localhost"),
            user=os.getenv("AUTH_DB_USER", "root"),
            password=os.getenv("AUTH_DB_PASSWORD", ""),
            database=os.getenv("AUTH_DB_NAME", "nyaaya_auth"),
            charset="utf8mb4",
            autocommit=True,
        )
    except MySQLError as e:  # pragma: no cover - connection errors in dev
        logger.error("Failed to create auth pool, using memory mode: %s", e)
        use_memory_db = True

def init_auth_db() -> None:
    """Create the MySQL users table if it does not exist.
    Skipped when DynamoDB mode is active.
    """
    global use_memory_db
    if AUTH_USE_DYNAMODB:
        return
    if not auth_db_pool:
        use_memory_db = True
        return
    try:
        conn = auth_db_pool.get_connection()
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
              email VARCHAR(255) PRIMARY KEY,
              user_id INT NOT NULL AUTO_INCREMENT UNIQUE,
              hashed_password VARCHAR(255) NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """
        )
        conn.commit()
        cur.close()
        conn.close()
        logger.info("Auth database initialized")
    except MySQLError as e:  # pragma: no cover
        logger.error("Error initializing auth database, switching to memory mode: %s", e)
        use_memory_db = True

init_auth_db()

# --- Pydantic models & helpers ---

class SignupRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    userId: int
    email: EmailStr

class AuthResponse(BaseModel):
    message: str
    token: str
    user: UserOut

JWT_SECRET = os.getenv("JWT_SECRET", "fallback-secret")

def generate_token(user_id: int | str, email: str) -> str:
    payload = {
        "userId": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=24),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def hash_password(password: str) -> str:
    if bcrypt:
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")
    # Fallback (not cryptographically secure, for testing only)
    return _fallback_hash(password)

def verify_password(password: str, hashed: str) -> bool:
    if bcrypt:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    # Fallback verification
    return _fallback_check(password, hashed)

# --- Signup endpoint ---

@router.post("/signup", response_model=AuthResponse)
def signup(body: SignupRequest) -> AuthResponse:
    email = body.email.lower().strip()
    password = body.password

    if len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters long",
        )

    hashed = hash_password(password)

    # DynamoDB path
    if AUTH_USE_DYNAMODB:
        try:
            existing = dynamo_get_item(DYNAMODB_TABLE_USERS, {"email": email})
        except DynamoDBServiceError as e:  # pragma: no cover
            logger.error("DynamoDB signup get_item error: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error")
        if existing:
            raise HTTPException(status_code=409, detail="User already exists")
        user_id = int(datetime.utcnow().timestamp() * 1000)
        item = {
            "email": email,
            "user_id": user_id,
            "hashed_password": hashed,
            "created_at": datetime.utcnow().isoformat(),
        }
        try:
            dynamo_put_item(DYNAMODB_TABLE_USERS, item)
        except DynamoDBServiceError as e:  # pragma: no cover
            logger.error("DynamoDB signup put_item error: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error")
        token = generate_token(user_id, email)
        logger.info("User created (DynamoDB mode): %s", email)
        return AuthResponse(message="User created (DynamoDB mode)", token=token, user=UserOut(userId=user_id, email=email))

    # In‑memory fallback
    if use_memory_db:
        if email in memory_users:
            raise HTTPException(status_code=409, detail="User already exists (Memory mode)")
        user_id = int(datetime.utcnow().timestamp() * 1000)
        memory_users[email] = {
            "user_id": user_id,
            "email": email,
            "hashed_password": hashed,
        }
        token = generate_token(user_id, email)
        logger.info("User created (Memory mode): %s", email)
        return AuthResponse(message="User created (Memory mode)", token=token, user=UserOut(userId=user_id, email=email))

    # MySQL path
    if not auth_db_pool:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    try:
        conn = auth_db_pool.get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT user_id FROM users WHERE email = %s",
            (email,)
        )
        existing = cur.fetchone()
        if existing:
            cur.close()
            conn.close()
            raise HTTPException(status_code=409, detail="User already exists")
        cur.execute(
            "INSERT INTO users (email, hashed_password) VALUES (%s, %s)",
            (email, hashed),
        )
        conn.commit()
        user_id = cur.lastrowid
        cur.close()
        conn.close()
    except MySQLError as e:  # pragma: no cover
        logger.error("Signup MySQL error: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")
    token = generate_token(user_id, email)
    logger.info("User created (MySQL mode): %s", email)
    return AuthResponse(message="User created successfully", token=token, user=UserOut(userId=user_id, email=email))

# --- Login endpoint ---

@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest) -> AuthResponse:
    email = body.email.lower().strip()
    password = body.password

    # DynamoDB path
    if AUTH_USE_DYNAMODB:
        try:
            user = dynamo_get_item(DYNAMODB_TABLE_USERS, {"email": email})
        except DynamoDBServiceError as e:  # pragma: no cover
            logger.error("DynamoDB login get_item error: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error")
        if not user or not verify_password(password, user.get("hashed_password", "")):
            logger.warning("Invalid login attempt (DynamoDB) for %s", email)
            raise HTTPException(status_code=401, detail="Invalid credentials")
        try:
            user_id = int(user.get("user_id"))
        except (TypeError, ValueError):
            raise HTTPException(status_code=500, detail="Corrupted user record")
        token = generate_token(user_id, user["email"])
        logger.info("Login successful (DynamoDB) for %s", email)
        return AuthResponse(message="Login successful (DynamoDB mode)", token=token, user=UserOut(userId=user_id, email=user["email"]))

    # In‑memory fallback
    if use_memory_db:
        user = memory_users.get(email)
        if not user or not verify_password(password, user["hashed_password"]):
            logger.warning("Invalid login attempt (Memory) for %s", email)
            raise HTTPException(status_code=401, detail="Invalid credentials (Memory mode)")
        token = generate_token(user["user_id"], user["email"])
        logger.info("Login successful (Memory) for %s", email)
        return AuthResponse(message="Login successful (Memory mode)", token=token, user=UserOut(userId=user["user_id"], email=user["email"]))

    # MySQL path
    if not auth_db_pool:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    try:
        conn = auth_db_pool.get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT user_id, email, hashed_password FROM users WHERE email = %s",
            (email,),
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
    except MySQLError as e:  # pragma: no cover
        logger.error("Login MySQL error: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")
    if not row or not verify_password(password, row["hashed_password"]):
        logger.warning("Invalid login attempt (MySQL) for %s", email)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = generate_token(row["user_id"], row["email"])
    logger.info("Login successful (MySQL) for %s", email)
    return AuthResponse(message="Login successful", token=token, user=UserOut(userId=row["user_id"], email=row["email"]))

# --- Logout (stateless) ---

@router.post("/logout")
def logout() -> dict:
    return {"message": "Logout successful"}

# --- Verify token endpoint ---

@router.get("/verify")
def verify(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No token provided")
    token = authorization.replace("Bearer ", "")
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = decoded.get("userId")
    email = decoded.get("email")
    # DynamoDB verification
    if AUTH_USE_DYNAMODB:
        try:
            user = dynamo_get_item(DYNAMODB_TABLE_USERS, {"email": email})
        except DynamoDBServiceError as e:  # pragma: no cover
            logger.error("DynamoDB verify get_item error: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error")
        try:
            stored_user_id = int(user.get("user_id")) if user else None
        except (TypeError, ValueError):
            raise HTTPException(status_code=500, detail="Corrupted user record")
        if not user or stored_user_id != user_id:
            raise HTTPException(status_code=401, detail="User not found")
        return {"valid": True, "user": {"userId": user_id, "email": email}}
    # In‑memory verification
    if use_memory_db:
        user = memory_users.get(email)
        if not user or user["user_id"] != user_id:
            raise HTTPException(status_code=401, detail="User not found")
        return {"valid": True, "user": {"userId": user_id, "email": email}}
    # MySQL verification
    if not auth_db_pool:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    try:
        conn = auth_db_pool.get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT user_id, email FROM users WHERE user_id = %s AND email = %s",
            (user_id, email),
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
    except MySQLError as e:  # pragma: no cover
        logger.error("Verify MySQL error: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")
    if not row:
        raise HTTPException(status_code=401, detail="User not found")
    return {"valid": True, "user": {"userId": row["user_id"], "email": row["email"]}}
