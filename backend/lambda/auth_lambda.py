import os
import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict

import boto3
import jwt
import bcrypt
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
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept",
        "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
        "Access-Control-Max-Age": "86400",  # Cache preflight for 24h
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
    # bcrypt hash (12 salt rounds)
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")

def _verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception as e:
        logger.error("Password verification error: %s", e)
        return False

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

    # Support both REST API (v1) and HTTP API (v2) formats
    method = event.get("httpMethod") or event.get("requestContext", {}).get("http", {}).get("method", "")
    path = event.get("path") or event.get("rawPath", "")

    # ------------------------------------------------------------------
    # CORS pre‑flight handling
    # ------------------------------------------------------------------
    if method == "OPTIONS":
        return _response(200, {"message": "CORS preflight OK"})

    # ------------------------------------------------------------------
    # Helper to safely parse JSON body
    # ------------------------------------------------------------------
    def _parse_body() -> Dict[str, Any]:
        try:
            return json.loads(event.get("body", "{}"))
        except (json.JSONDecodeError, TypeError):
            raise ValueError("Invalid JSON payload")

    # ------------------------------------------------------------------
    # Normalize path – handle potential stage prefix (e.g. /prod/auth/signup -> /auth/signup)
    # ------------------------------------------------------------------
    clean_path = path
    if "/auth/" in path:
        clean_path = "/auth/" + path.split("/auth/")[1]

    # ------------------------------------------------------------------
    # /auth/signup
    # ------------------------------------------------------------------
    if clean_path == "/auth/signup" and method == "POST":
        try:
            payload = _parse_body()
        except ValueError as e:
            return _error(400, str(e))

        # Required fields validation
        # Support both new and legacy field names
        # Legacy keys: name, phone, confirm_password may be missing
        full_name = payload.get("full_name") or payload.get("name")
        phone_number = payload.get("phone_number") or payload.get("phone")
        email = payload.get("email")
        password = payload.get("password")

        # Validate required fields (email and password are mandatory)
        required = ["email", "password"]
        missing = [f for f in required if not payload.get(f)]
        if missing:
            return _error(400, f"Missing fields: {', '.join(missing)}")

        # At this point email and password are guaranteed to be present
        email = payload["email"].strip().lower()
        password = payload["password"]
        # Optional fields
        full_name = payload.get("full_name") or payload.get("name")
        phone_number = payload.get("phone_number") or payload.get("phone")
        confirm_password = payload.get("confirm_password")

        # Password length check (password is a string here)
        if len(password) < 6:
            return _error(400, "Password must be at least 6 characters long")

        # If confirm_password is provided, ensure it matches
        if confirm_password is not None and password != confirm_password:
            return _error(400, "Passwords do not match")

        hashed = _hash_password(password)
        import uuid
        user_id = str(uuid.uuid4())

        # Check for existing user
        if _get_user(email):
            return _error(409, "User already exists")

        # Build the DynamoDB item, including optional fields only if they are present
        item = {
            "email": email,
            "user_id": user_id,
            "password_hash": hashed,
            "created_at": datetime.utcnow().isoformat(),
        }
        if full_name:
            item["full_name"] = full_name
        if phone_number:
            item["phone_number"] = phone_number
        try:
            _put_user(item)
        except Exception:
            return _error(500, "Internal server error")

        token = _generate_token(user_id, email)
        return _response(201, {
            "message": "User created successfully",
            "token": token,
            "user": {"userId": user_id, "email": email, "full_name": full_name, "phone_number": phone_number},
        })

    # ------------------------------------------------------------------
    # /auth/login
    # ------------------------------------------------------------------
    if clean_path == "/auth/login" and method == "POST":
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
        if not user or not _verify_password(password, user.get("password_hash", "")):
            return _error(401, "Invalid credentials")

        # user_id may be stored as string (UUID) – ensure we keep it as is
        user_id = user.get("user_id")
        if not user_id:
            return _error(500, "Corrupted user record")

        token = _generate_token(user_id, email)
        return _response(200, {
            "message": "Login successful",
            "token": token,
            "user": {"userId": user_id, "email": email, "full_name": user.get("full_name"), "phone_number": user.get("phone_number")},
        })

    # ------------------------------------------------------------------
    # Unknown route
    # ------------------------------------------------------------------
    return _error(404, "Not found")
