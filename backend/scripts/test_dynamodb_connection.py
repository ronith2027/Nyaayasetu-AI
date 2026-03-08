import json
import os
import sys
import time

from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config.dynamodb import get_dynamodb_resource, DynamoDBConfigError  # noqa: E402
from services.dynamodb_service import (  # noqa: E402
    DYNAMODB_TABLE_CHATS,
    DynamoDBServiceError,
    get_item,
    put_item,
)


def main() -> None:
    """
    Simple connectivity test for DynamoDB.

    - Writes a test item into the chat table
    - Reads it back by primary key
    """
    load_dotenv()

    table_name = os.getenv("DYNAMODB_TABLE_CHATS", DYNAMODB_TABLE_CHATS)

    print(f"Testing DynamoDB connection using table: {table_name}")

    try:
        # Ensure resource can be created
        get_dynamodb_resource()
        print("DynamoDB resource initialized successfully.")
    except DynamoDBConfigError as e:
        print(f"[ERROR] DynamoDB configuration error: {e}")
        sys.exit(1)

    test_user_id = "test-user"
    timestamp = int(time.time() * 1000)

    test_item = {
        "user_id": test_user_id,
        "timestamp": timestamp,
        "user_message": "Hello from test_dynamodb_connection.py",
        "ai_response": "This is a test response.",
    }

    try:
        put_item(table_name, test_item)
        print("PutItem succeeded.")
    except DynamoDBServiceError as e:
        print(f"[ERROR] Failed to put item: {e}")
        sys.exit(1)

    try:
        fetched = get_item(table_name, {"user_id": test_user_id, "timestamp": timestamp})
    except DynamoDBServiceError as e:
        print(f"[ERROR] Failed to get item back: {e}")
        sys.exit(1)

    if not fetched:
        print("[ERROR] No item returned from DynamoDB.")
        sys.exit(1)

    print("GetItem succeeded. Item:")
    print(json.dumps(fetched, indent=2, default=str))


if __name__ == "__main__":
    main()

