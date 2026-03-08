import os
from typing import Any, Dict, List, Optional

from boto3.dynamodb.conditions import Key
from botocore.exceptions import BotoCoreError, ClientError

from backend.config.dynamodb import get_dynamodb_resource, DynamoDBConfigError


DYNAMODB_TABLE_USERS = os.getenv("DYNAMODB_TABLE_USERS", "Users")
DYNAMODB_TABLE_CHATS = os.getenv("DYNAMODB_TABLE_CHATS", "UserChats")
DYNAMODB_TABLE_USER_FORMS = os.getenv("DYNAMODB_TABLE_USER_FORMS", "UserForms")
DYNAMODB_TABLE_USER_DOCUMENTS = os.getenv("DYNAMODB_TABLE_USER_DOCUMENTS", "UserDocuments")


class DynamoDBServiceError(RuntimeError):
    """Raised when a DynamoDB operation fails."""


def _get_table(table_name: str):
    try:
        resource = get_dynamodb_resource()
    except DynamoDBConfigError as e:
        raise DynamoDBServiceError(str(e)) from e

    try:
        return resource.Table(table_name)
    except (BotoCoreError, ClientError) as e:
        raise DynamoDBServiceError(f"Failed to access DynamoDB table '{table_name}': {e}") from e


def put_item(table_name: str, item: Dict[str, Any]) -> None:
    """
    Put an item into a DynamoDB table.
    """
    table = _get_table(table_name)
    try:
        table.put_item(Item=item)
    except (BotoCoreError, ClientError) as e:
        raise DynamoDBServiceError(f"Failed to put item into table '{table_name}': {e}") from e


def get_item(table_name: str, key: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Get a single item from a DynamoDB table by primary key.
    """
    table = _get_table(table_name)
    try:
        resp = table.get_item(Key=key)
    except (BotoCoreError, ClientError) as e:
        raise DynamoDBServiceError(f"Failed to get item from table '{table_name}': {e}") from e

    return resp.get("Item")


def query_items(
    table_name: str,
    key_condition,
    index_name: Optional[str] = None,
    limit: Optional[int] = None,
    scan_forward: bool = True,
    filter_expression=None,
) -> List[Dict[str, Any]]:
    """
    Query items from a DynamoDB table using a KeyConditionExpression.

    Example:
        from boto3.dynamodb.conditions import Key
        items = query_items("UserChats", Key("user_id").eq("123"))
    """
    table = _get_table(table_name)
    query_kwargs: Dict[str, Any] = {"KeyConditionExpression": key_condition}

    if index_name:
        query_kwargs["IndexName"] = index_name
    if limit is not None:
        query_kwargs["Limit"] = limit
    if not scan_forward:
        query_kwargs["ScanIndexForward"] = False
    if filter_expression is not None:
        query_kwargs["FilterExpression"] = filter_expression

    try:
        resp = table.query(**query_kwargs)
    except (BotoCoreError, ClientError) as e:
        raise DynamoDBServiceError(f"Failed to query items from table '{table_name}': {e}") from e

    return resp.get("Items", [])


def delete_item(table_name: str, key: Dict[str, Any]) -> None:
    """
    Delete a single item from a DynamoDB table by primary key.
    """
    table = _get_table(table_name)
    try:
        table.delete_item(Key=key)
    except (BotoCoreError, ClientError) as e:
        raise DynamoDBServiceError(f"Failed to delete item from table '{table_name}': {e}") from e


def save_chat_message(user_id: str, user_message: str, ai_response: str, timestamp: Optional[int] = None) -> None:
    """
    Convenience helper to store a chat message into the UserChats table.

    Partition key: user_id
    Sort key: timestamp
    """
    import time

    if not user_id:
        user_id = "anonymous"

    if timestamp is None:
        timestamp = int(time.time() * 1000)

    item = {
        "user_id": str(user_id),
        "timestamp": int(timestamp),
        "user_message": user_message,
        "ai_response": ai_response,
    }

    put_item(DYNAMODB_TABLE_CHATS, item)


def get_chat_history_for_user(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Fetch recent chat messages for a user from the UserChats table.
    """
    if not user_id:
        user_id = "anonymous"

    return query_items(
        DYNAMODB_TABLE_CHATS,
        Key("user_id").eq(str(user_id)),
        limit=limit,
        scan_forward=False,
    )

