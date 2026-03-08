import json
import boto3
import os
from datetime import datetime
from botocore.exceptions import ClientError

# DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
files_table = dynamodb.Table(os.environ.get('FILES_TABLE', 'Files'))
folders_table = dynamodb.Table(os.environ.get('FOLDERS_TABLE', 'Folders'))

def lambda_handler(event, context):
    """
    Lambda handler for getting user files and folders
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
                    'Access-Control-Allow-Methods': 'GET,OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Authentication required'
                })
            }
        
        token = auth_header.split(' ')[1]
        
        # Extract user_id from path parameters
        path_params = event.get('pathParameters', {})
        user_id = path_params.get('userId', '')
        
        # Extract query parameters
        query_params = event.get('queryStringParameters', {}) or {}
        folder_id = query_params.get('folderId', 'root')
        search = query_params.get('search', '')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'userId is required'
                })
            }
        
        # Get folders in current folder
        folders = []
        try:
            if search:
                # Search folders by name
                response = folders_table.query(
                    IndexName='user_parent_folder-index',
                    KeyConditionExpression='user_id = :user_id AND parent_folder_id = :parent_folder_id',
                    FilterExpression='contains(folder_name, :search)',
                    ExpressionAttributeValues={
                        ':user_id': user_id,
                        ':parent_folder_id': folder_id,
                        ':search': search
                    }
                )
            else:
                # Get all folders in current folder
                response = folders_table.query(
                    IndexName='user_parent_folder-index',
                    KeyConditionExpression='user_id = :user_id AND parent_folder_id = :parent_folder_id',
                    ExpressionAttributeValues={
                        ':user_id': user_id,
                        ':parent_folder_id': folder_id
                    }
                )
            
            folders = response.get('Items', [])
            
            # Get file count for each folder
            for folder in folders:
                try:
                    files_response = files_table.query(
                        IndexName='user_folder-index',
                        KeyConditionExpression='user_id = :user_id AND folder_id = :folder_id',
                        ExpressionAttributeValues={
                            ':user_id': user_id,
                            ':folder_id': folder['folder_id']
                        },
                        Select='COUNT'
                    )
                    folder['file_count'] = files_response.get('Count', 0)
                except:
                    folder['file_count'] = 0
            
            # Sort folders by creation date (newest first)
            folders.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            
        except ClientError as e:
            print(f"DynamoDB error getting folders: {e}")
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Failed to retrieve folders'
                })
            }
        
        # Get files in current folder
        files = []
        try:
            if search:
                # Search files by name
                response = files_table.query(
                    IndexName='user_folder-index',
                    KeyConditionExpression='user_id = :user_id AND folder_id = :folder_id',
                    FilterExpression='contains(file_name, :search)',
                    ExpressionAttributeValues={
                        ':user_id': user_id,
                        ':folder_id': folder_id,
                        ':search': search
                    }
                )
            else:
                # Get all files in current folder
                response = files_table.query(
                    IndexName='user_folder-index',
                    KeyConditionExpression='user_id = :user_id AND folder_id = :folder_id',
                    ExpressionAttributeValues={
                        ':user_id': user_id,
                        ':folder_id': folder_id
                    }
                )
            
            files = response.get('Items', [])
            
            # Format file data
            formatted_files = []
            for file in files:
                formatted_files.append({
                    'file_id': file['file_id'],
                    'file_name': file['file_name'],
                    'file_type': file['file_type'],
                    'file_size': file['file_size'],
                    'file_url': file['file_url'],
                    'folder_id': file['folder_id'],
                    'created_at': file['created_at']
                })
            
            # Sort files by creation date (newest first)
            formatted_files.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            
        except ClientError as e:
            print(f"DynamoDB error getting files: {e}")
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Failed to retrieve files'
                })
            }
        
        # Get current folder info if not root
        current_folder = None
        if folder_id != 'root':
            try:
                folder_response = folders_table.get_item(
                    Key={'folder_id': folder_id}
                )
                
                if 'Item' in folder_response and folder_response['Item'].get('user_id') == user_id:
                    current_folder = folder_response['Item']
            except:
                pass
        
        # Get breadcrumb path
        breadcrumb = []
        if current_folder:
            breadcrumb.append({
                'folder_id': current_folder['folder_id'],
                'folder_name': current_folder['folder_name']
            })
            
            # Get parent folders recursively
            parent_id = current_folder.get('parent_folder_id')
            while parent_id and parent_id != 'root':
                try:
                    parent_response = folders_table.get_item(
                        Key={'folder_id': parent_id}
                    )
                    
                    if 'Item' in parent_response and parent_response['Item'].get('user_id') == user_id:
                        parent = parent_response['Item']
                        breadcrumb.insert(0, {
                            'folder_id': parent['folder_id'],
                            'folder_name': parent['folder_name']
                        })
                        parent_id = parent.get('parent_folder_id')
                    else:
                        break
                except:
                    break
        
        # Success response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            },
            'body': json.dumps({
                'success': True,
                'data': {
                    'folders': folders,
                    'files': formatted_files,
                    'current_folder': current_folder,
                    'breadcrumb': breadcrumb,
                    'folder_id': folder_id
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
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Internal server error'
            })
        }
