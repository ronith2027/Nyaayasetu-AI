import json
import boto3
import os
from datetime import datetime
from botocore.exceptions import ClientError

# DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
files_table = dynamodb.Table(os.environ.get('FILES_TABLE', 'Files'))
folders_table = dynamodb.Table(os.environ.get('FOLDERS_TABLE', 'Folders'))

# S3 client
s3_client = boto3.client('s3')
S3_BUCKET = os.environ.get('S3_BUCKET', 'nyayasetu-files')

def lambda_handler(event, context):
    """
    Lambda handler for deleting files and folders
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
                    'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Authentication required'
                })
            }
        
        token = auth_header.split(' ')[1]
        
        # Extract file_id from path parameters
        path_params = event.get('pathParameters', {})
        file_id = path_params.get('fileId', '')
        
        if not file_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'fileId is required'
                })
            }
        
        # Check if it's a file or folder
        is_folder = file_id.startswith('folder_')
        item_id = file_id.replace('folder_', '') if is_folder else file_id
        
        if is_folder:
            # Delete folder and all its contents
            return delete_folder(item_id, token)
        else:
            # Delete file
            return delete_file(item_id, token)
            
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Internal server error'
            })
        }

def delete_file(file_id, token):
    """
    Delete a single file
    """
    try:
        # Get file from DynamoDB
        try:
            file_response = files_table.get_item(
                Key={'file_id': file_id}
            )
            
            if 'Item' not in file_response:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                        'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': 'File not found'
                    })
                }
            
            file_item = file_response['Item']
            s3_key = file_item.get('s3_key')
            
        except ClientError as e:
            print(f"DynamoDB error getting file: {e}")
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Failed to retrieve file'
                })
            }
        
        # Delete file from S3
        if s3_key:
            try:
                s3_client.delete_object(Bucket=S3_BUCKET, Key=s3_key)
            except ClientError as e:
                print(f"S3 deletion error: {e}")
                # Continue even if S3 deletion fails
        
        # Delete file metadata from DynamoDB
        try:
            files_table.delete_item(
                Key={'file_id': file_id}
            )
        except ClientError as e:
            print(f"DynamoDB error deleting file: {e}")
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Failed to delete file'
                })
            }
        
        # Success response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            },
            'body': json.dumps({
                'success': True,
                'message': 'File deleted successfully'
            })
        }
        
    except Exception as e:
        print(f"Unexpected error in delete_file: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Internal server error'
            })
        }

def delete_folder(folder_id, token):
    """
    Delete a folder and all its contents (files and subfolders)
    """
    try:
        # Get folder from DynamoDB
        try:
            folder_response = folders_table.get_item(
                Key={'folder_id': folder_id}
            )
            
            if 'Item' not in folder_response:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                        'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': 'Folder not found'
                    })
                }
            
            folder_item = folder_response['Item']
            
        except ClientError as e:
            print(f"DynamoDB error getting folder: {e}")
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Failed to retrieve folder'
                })
            }
        
        # Get all files in this folder
        deleted_files = []
        try:
            files_response = files_table.query(
                IndexName='user_folder-index',
                KeyConditionExpression='user_id = :user_id AND folder_id = :folder_id',
                ExpressionAttributeValues={
                    ':user_id': folder_item['user_id'],
                    ':folder_id': folder_id
                }
            )
            
            files = files_response.get('Items', [])
            
            # Delete all files
            for file in files:
                # Delete from S3
                s3_key = file.get('s3_key')
                if s3_key:
                    try:
                        s3_client.delete_object(Bucket=S3_BUCKET, Key=s3_key)
                    except:
                        pass
                
                # Delete from DynamoDB
                try:
                    files_table.delete_item(Key={'file_id': file['file_id']})
                except:
                    pass
                
                deleted_files.append(file['file_name'])
            
        except ClientError as e:
            print(f"Error deleting files in folder: {e}")
        
        # Get all subfolders and delete them recursively
        deleted_folders = []
        try:
            subfolders_response = folders_table.query(
                IndexName='user_parent_folder-index',
                KeyConditionExpression='user_id = :user_id AND parent_folder_id = :parent_folder_id',
                ExpressionAttributeValues={
                    ':user_id': folder_item['user_id'],
                    ':parent_folder_id': folder_id
                }
            )
            
            subfolders = subfolders_response.get('Items', [])
            
            # Recursively delete subfolders
            for subfolder in subfolders:
                subfolder_result = delete_folder(subfolder['folder_id'], token)
                if subfolder_result['statusCode'] == 200:
                    deleted_folders.append(subfolder['folder_name'])
            
        except ClientError as e:
            print(f"Error deleting subfolders: {e}")
        
        # Delete the folder itself
        try:
            folders_table.delete_item(
                Key={'folder_id': folder_id}
            )
        except ClientError as e:
            print(f"DynamoDB error deleting folder: {e}")
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Failed to delete folder'
                })
            }
        
        # Success response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Folder deleted successfully',
                'deleted_files': deleted_files,
                'deleted_folders': deleted_folders
            })
        }
        
    except Exception as e:
        print(f"Unexpected error in delete_folder: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Internal server error'
            })
        }
