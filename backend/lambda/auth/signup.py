import json
import bcrypt
import uuid
import boto3
from datetime import datetime
from botocore.exceptions import ClientError

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
users_table = dynamodb.Table('Users')

def lambda_handler(event, context):
    """
    Lambda handler for user signup
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Extract fields
        full_name = body.get('full_name', '').strip()
        email = body.get('email', '').strip().lower()
        phone_number = body.get('phone_number', '').strip()
        password = body.get('password', '')
        confirm_password = body.get('confirm_password', '')
        
        # Validate required fields
        errors = []
        if not full_name:
            errors.append('Full name is required')
        if not email:
            errors.append('Email address is required')
        if not password:
            errors.append('Password is required')
        if not confirm_password:
            errors.append('Confirm password is required')
        
        if errors:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Validation failed',
                    'details': errors
                })
            }
        
        # Validate email format
        if '@' not in email or '.' not in email:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Invalid email format'
                })
            }
        
        # Validate password match
        if password != confirm_password:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Passwords do not match'
                })
            }
        
        # Check if email already exists
        try:
            response = users_table.get_item(
                Key={'email': email}
            )
            
            if 'Item' in response:
                return {
                    'statusCode': 409,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': 'Email already exists'
                    })
                }
        except ClientError as e:
            print(f"DynamoDB error checking email: {e}")
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Database error'
                })
            }
        
        # Hash password
        try:
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        except Exception as e:
            print(f"Password hashing error: {e}")
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Password processing failed'
                })
            }
        
        # Create user item
        user_item = {
            'user_id': str(uuid.uuid4()),
            'full_name': full_name,
            'email': email,
            'phone_number': phone_number if phone_number else None,
            'password_hash': password_hash,
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Remove None values
        user_item = {k: v for k, v in user_item.items() if v is not None}
        
        # Save to DynamoDB
        try:
            users_table.put_item(Item=user_item)
        except ClientError as e:
            print(f"DynamoDB error saving user: {e}")
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Failed to create user'
                })
            }
        
        # Success response
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'success': True,
                'message': 'User created successfully',
                'user': {
                    'user_id': user_item['user_id'],
                    'full_name': user_item['full_name'],
                    'email': user_item['email'],
                    'phone_number': user_item.get('phone_number')
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
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Internal server error'
            })
        }
