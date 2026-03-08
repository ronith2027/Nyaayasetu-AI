import os
from typing import Optional

import boto3
from botocore.exceptions import BotoCoreError, NoCredentialsError
from dotenv import load_dotenv


load_dotenv()

_dynamodb_resource: Optional["boto3.resources.base.ServiceResource"] = None


class DynamoDBConfigError(RuntimeError):
    """Raised when DynamoDB configuration or credentials are invalid."""


def get_dynamodb_resource() -> "boto3.resources.base.ServiceResource":
    """
    Lazily initialize and return a shared DynamoDB resource.

    Configuration is read from environment variables:
    - AWS_ACCESS_KEY_ID (optional if using IAM role)
    - AWS_SECRET_ACCESS_KEY (optional if using IAM role)
    - AWS_SESSION_TOKEN (optional)
    - AWS_REGION (required)
    - DYNAMODB_ENDPOINT_URL (optional - for local testing like DynamoDB Local)
    """
    global _dynamodb_resource

    if _dynamodb_resource is not None:
        return _dynamodb_resource

    aws_region = os.getenv("AWS_REGION")
    if not aws_region:
        raise DynamoDBConfigError("Missing AWS_REGION environment variable for DynamoDB.")

    session_kwargs: dict = {"region_name": aws_region}

    aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    aws_session_token = os.getenv("AWS_SESSION_TOKEN")

    if aws_access_key_id and aws_secret_access_key:
        session_kwargs["aws_access_key_id"] = aws_access_key_id
        session_kwargs["aws_secret_access_key"] = aws_secret_access_key
        if aws_session_token:
            session_kwargs["aws_session_token"] = aws_session_token

    endpoint_url = os.getenv("DYNAMODB_ENDPOINT_URL") or None

    try:
        _dynamodb_resource = boto3.resource(
            "dynamodb",
            endpoint_url=endpoint_url,
            **session_kwargs,
        )
    except NoCredentialsError as e:
        raise DynamoDBConfigError(f"AWS credentials are not configured for DynamoDB: {e}") from e
    except BotoCoreError as e:
        raise DynamoDBConfigError(f"Failed to initialize DynamoDB resource: {e}") from e

    return _dynamodb_resource

