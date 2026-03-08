import json
import boto3
import os
import uuid
from datetime import datetime
from botocore.exceptions import ClientError

# DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
folders_table = dynamodb.Table(os.environ.get('FOLDERS_TABLE', 'Folders'))

def lambda_handler(event, context):
    """
    Lambda handler for creating folders
    """
    try:
        # Extract token from Authorization header
        headers = event.get('headers', {})
        auth_header = headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Authentication required'
                })
            }
        
        token = auth_header.split(' ')[1]
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Extract fields
        user_id = body.get('user_id', '')
        folder_name = body.get('folder_name', '')
        parent_folder_id = body.get('parent_folder_id', None)
        
        # Validate required fields
        if not user_id or not folder_name:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'user_id and folder_name are required'
                })
            }
        
        # Validate parent folder belongs to user if provided
        if parent_folder_id:
            try:
                folder_response = folders_table.get_item(
                    Key={'folder_id': parent_folder_id}
                )
                
                if 'Item' not in folder_response or folder_response['Item'].get('user_id') != user_id:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                            'Access-Control-Allow-Methods': 'POST,OPTIONS'
                        },
                        'body': json.dumps({
                            'success': False,
                            'error': 'Invalid parent folder'
                        })
                    }
            except ClientError as e:
                print(f"DynamoDB error checking parent folder: {e}")
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                        'Access-Control-Allow-Methods': 'POST,OPTIONS'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': 'Failed to validate parent folder'
                    })
                }
        
        # Check if folder name already exists in the same parent
        try:
            response = folders_table.query(
                IndexName='user_parent_folder-index',
                KeyConditionExpression='user_id = :user_id AND parent_folder_id = :parent_folder_id',
                FilterExpression='folder_name = :folder_name',
                ExpressionAttributeValues={
                    ':user_id': user_id,
                    ':parent_folder_id': parent_folder_id or 'root',
                    ':folder_name': folder_name
                }
            )
            
            if response.get('Items'):
                return {
                    'statusCode': 409,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                        'Access-Control-Allow-Methods': 'POST,OPTIONS'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': 'Folder with this name already exists'
                    })
                }
        except ClientError as e:
            print(f"DynamoDB error checking folder name: {e}")
            # Continue even if check fails
        
        # Create folder item
        folder_item = {
            'folder_id': str(uuid.uuid4()),
            'user_id': user_id,
            'folder_name': folder_name,
            'parent_folder_id': parent_folder_id or 'root',
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Save to DynamoDB
        try:
            folders_table.put_item(Item=folder_item)
        except ClientError as e:
            print(f"DynamoDB error saving folder: {e}")
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Failed to create folder'
                })
            }
        
        # Success response
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Folder created successfully',
                'folder': {
                    'folder_id': folder_item['folder_id'],
                    'folder_name': folder_item['folder_name'],
                    'parent_folder_id': folder_item['parent_folder_id'],
                    'created_at': folder_item['created_at']
                }
            })
        }
        
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Internal server error'
            })
        }
