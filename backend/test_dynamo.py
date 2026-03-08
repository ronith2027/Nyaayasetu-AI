import os
import sys
import logging
from datetime import datetime

# Ensure the project root is in PYTHONPATH
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(project_root)

from services.dynamodb_service import (
    DYNAMODB_TABLE_USERS,
    get_item as dynamo_get_item,
    put_item as dynamo_put_item,
    DynamoDBServiceError,
)

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_dynamo")


def test_signup_and_login(email: str, password: str):
    # Simulate signup: hash password and store
    try:
        # Check if user exists
        existing = dynamo_get_item(DYNAMODB_TABLE_USERS, {"email": email})
        if existing:
            logger.info("User already exists, deleting for clean test.")
            # For simplicity, we won't implement delete here; just abort.
            return
    except DynamoDBServiceError as e:
        logger.error("Error checking existing user: %s", e)
        return

    # Simple password hashing (reuse same function as backend)
    import bcrypt
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(12)).decode("utf-8")
    user_id = int(datetime.utcnow().timestamp() * 1000)
    item = {
        "email": email,
        "user_id": user_id,
        "hashed_password": hashed,
        "created_at": datetime.utcnow().isoformat(),
    }
    try:
        dynamo_put_item(DYNAMODB_TABLE_USERS, item)
        logger.info("User inserted: %s", email)
    except DynamoDBServiceError as e:
        logger.error("Error inserting user: %s", e)
        return

    # Retrieve and verify password
    try:
        stored = dynamo_get_item(DYNAMODB_TABLE_USERS, {"email": email})
        if not stored:
            logger.error("Failed to retrieve user after insert.")
            return
        # Verify password
        if bcrypt.checkpw(password.encode("utf-8"), stored["hashed_password"].encode("utf-8")):
            logger.info("Password verification succeeded for %s", email)
        else:
            logger.error("Password verification failed for %s", email)
    except DynamoDBServiceError as e:
        logger.error("Error during retrieval: %s", e)


if __name__ == "__main__":
    test_email = "test_user@example.com"
    test_password = "TestPass123"
    test_signup_and_login(test_email, test_password)
