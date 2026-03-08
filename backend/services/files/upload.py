import json
import boto3
import os
import uuid
from datetime import datetime
from botocore.exceptions import ClientError

# DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
files_table = dynamodb.Table(os.environ.get('FILES_TABLE', 'Files'))
folders_table = dynamodb.Table(os.environ.get('FOLDERS_TABLE', 'Folders'))

# S3 client
s3_client = boto3.client('s3')
S3_BUCKET = os.environ.get('S3_BUCKET', 'nyayasetu-files')
S3_REGION = os.environ.get('AWS_REGION', 'us-east-1')

def lambda_handler(event, context):
    """
    Lambda handler for file upload
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
        file_name = body.get('file_name', '')
        file_content = body.get('file_content', '')  # Base64 encoded file content
        file_type = body.get('file_type', '')
        file_size = body.get('file_size', 0)
        folder_id = body.get('folder_id', None)
        
        # Validate required fields
        if not user_id or not file_name or not file_content:
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
                    'error': 'user_id, file_name, and file_content are required'
                })
            }
        
        # Validate folder belongs to user if provided
        if folder_id:
            try:
                folder_response = folders_table.get_item(
                    Key={'folder_id': folder_id}
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
                            'error': 'Invalid folder'
                        })
                    }
            except ClientError as e:
                print(f"DynamoDB error checking folder: {e}")
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
                        'error': 'Failed to validate folder'
                    })
                }
        
        # Generate unique file ID and S3 key
        file_id = str(uuid.uuid4())
        s3_key = f"files/{user_id}/{file_id}_{file_name}"
        
        # Upload file to S3
        try:
            import base64
            file_data = base64.b64decode(file_content)
            
            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=s3_key,
                Body=file_data,
                ContentType=file_type,
                Metadata={
                    'user_id': user_id,
                    'file_name': file_name,
                    'original_name': file_name
                }
            )
            
            # Generate S3 URL
            file_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{s3_key}"
            
        except ClientError as e:
            print(f"S3 upload error: {e}")
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
                    'error': 'Failed to upload file'
                })
            }
        
        # Save file metadata to DynamoDB
        file_item = {
            'file_id': file_id,
            'user_id': user_id,
            'file_name': file_name,
            'file_url': file_url,
            's3_key': s3_key,
            'file_type': file_type,
            'file_size': file_size,
            'folder_id': folder_id,
            'created_at': datetime.utcnow().isoformat()
        }
        
        try:
            files_table.put_item(Item=file_item)
        except ClientError as e:
            print(f"DynamoDB error saving file metadata: {e}")
            # Try to delete from S3 to maintain consistency
            try:
                s3_client.delete_object(Bucket=S3_BUCKET, Key=s3_key)
            except:
                pass
            
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
                    'error': 'Failed to save file metadata'
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
                'message': 'File uploaded successfully',
                'file': {
                    'file_id': file_id,
                    'file_name': file_name,
                    'file_type': file_type,
                    'file_size': file_size,
                    'file_url': file_url,
                    'folder_id': folder_id,
                    'created_at': file_item['created_at']
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
