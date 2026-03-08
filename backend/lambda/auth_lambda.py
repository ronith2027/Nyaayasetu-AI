import os
import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict

import boto3
import jwt
from botocore.exceptions import BotoCoreError, ClientError

# ----------------------------------------------------------------------
# Logging configuration (cloud‑watch friendly)
# ----------------------------------------------------------------------
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ----------------------------------------------------------------------
# Environment variables (set in the Lambda console or via SAM)
# ----------------------------------------------------------------------
TABLE_USERS = os.getenv("DYNAMODB_TABLE_USERS", "Users")
JWT_SECRET = os.getenv("JWT_SECRET", "fallback-secret")

# ----------------------------------------------------------------------
# Boto3 DynamoDB resource – reused across invocations for performance
# ----------------------------------------------------------------------
try:
    dynamodb = boto3.resource("dynamodb")
except (BotoCoreError, ClientError) as e:
    logger.error("Failed to initialise DynamoDB resource: %s", e)
    raise

users_table = dynamodb.Table(TABLE_USERS)

# ----------------------------------------------------------------------
# Helper utilities
# ----------------------------------------------------------------------
def _cors_headers() -> Dict[str, str]:
    """Common CORS headers for every response."""
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
    }

def _response(status: int, body: Any) -> Dict[str, Any]:
    """Wrap body into the API‑Gateway expected format."""
    return {
        "statusCode": status,
        "headers": _cors_headers(),
        "body": json.dumps(body),
    }

def _error(status: int, message: str) -> Dict[str, Any]:
    return _response(status, {"error": message})

# ----------------------------------------------------------------------
# Password handling – simple SHA‑256 fallback (replace with bcrypt/argon2 in prod)
# ----------------------------------------------------------------------
import hashlib

def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def _verify_password(password: str, hashed: str) -> bool:
    return _hash_password(password) == hashed

# ----------------------------------------------------------------------
# JWT handling
# ----------------------------------------------------------------------
def _generate_token(user_id: int | str, email: str) -> str:
    payload = {
        "userId": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=24),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

# ----------------------------------------------------------------------
# DynamoDB helpers (thin wrappers around the generic table object)
# ----------------------------------------------------------------------
def _get_user(email: str) -> Dict[str, Any] | None:
    try:
        resp = users_table.get_item(Key={"email": email})
    except (BotoCoreError, ClientError) as e:
        logger.error("DynamoDB get_item error: %s", e)
        raise
    return resp.get("Item")

def _put_user(item: Dict[str, Any]) -> None:
    try:
        users_table.put_item(Item=item)
    except (BotoCoreError, ClientError) as e:
        logger.error("DynamoDB put_item error: %s", e)
        raise

# ----------------------------------------------------------------------
# Main Lambda entry point – API‑Gateway proxy integration
# ----------------------------------------------------------------------
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Dispatch based on HTTP method and path.

    Expected routes (proxy‑integrated):
        POST /auth/signup
        POST /auth/login
        OPTIONS * (CORS pre‑flight)
    """
    logger.info("Received event: %s", json.dumps(event))

    # ------------------------------------------------------------------
    # CORS pre‑flight handling
    # ------------------------------------------------------------------
    if event.get("httpMethod") == "OPTIONS":
        return _response(200, {"message": "CORS preflight OK"})

    path = event.get("path", "")
    method = event.get("httpMethod", "")

    # ------------------------------------------------------------------
    # Helper to safely parse JSON body
    # ------------------------------------------------------------------
    def _parse_body() -> Dict[str, Any]:
        try:
            return json.loads(event.get("body", "{}"))
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON payload")

    # ------------------------------------------------------------------
    # /auth/signup
    # ------------------------------------------------------------------
    if path == "/auth/signup" and method == "POST":
        try:
            payload = _parse_body()
        except ValueError as e:
            return _error(400, str(e))

        # Required fields validation
        required = ["name", "email", "phone", "password"]
        missing = [f for f in required if not payload.get(f)]
        if missing:
            return _error(400, f"Missing fields: {', '.join(missing)}")

        email = payload["email"].strip().lower()
        password = payload["password"]
        name = payload["name"]
        phone = payload["phone"]

        if len(password) < 6:
            return _error(400, "Password must be at least 6 characters long")

        hashed = _hash_password(password)
        user_id = int(datetime.utcnow().timestamp() * 1000)

        # Check for existing user
        if _get_user(email):
            return _error(409, "User already exists")

        item = {
            "email": email,
            "user_id": user_id,
            "name": name,
            "phone": phone,
            "hashed_password": hashed,
            "created_at": datetime.utcnow().isoformat(),
        }
        try:
            _put_user(item)
        except Exception:
            return _error(500, "Internal server error")

        token = _generate_token(user_id, email)
        return _response(201, {
            "message": "User created successfully",
            "token": token,
            "user": {"userId": user_id, "email": email},
        })

    # ------------------------------------------------------------------
    # /auth/login
    # ------------------------------------------------------------------
    if path == "/auth/login" and method == "POST":
        try:
            payload = _parse_body()
        except ValueError as e:
            return _error(400, str(e))

        required = ["email", "password"]
        missing = [f for f in required if not payload.get(f)]
        if missing:
            return _error(400, f"Missing fields: {', '.join(missing)}")

        email = payload["email"].strip().lower()
        password = payload["password"]

        user = _get_user(email)
        if not user or not _verify_password(password, user.get("hashed_password", "")):
            return _error(401, "Invalid credentials")

        try:
            user_id = int(user["user_id"])
        except (KeyError, TypeError, ValueError):
            return _error(500, "Corrupted user record")

        token = _generate_token(user_id, email)
        return _response(200, {
            "message": "Login successful",
            "token": token,
            "user": {"userId": user_id, "email": email},
        })

    # ------------------------------------------------------------------
    # Unknown route
    # ------------------------------------------------------------------
    return _error(404, "Not found")
