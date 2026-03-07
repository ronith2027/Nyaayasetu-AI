import json
import bcrypt
import jwt
import boto3
from datetime import datetime, timedelta
from botocore.exceptions import ClientError

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
users_table = dynamodb.Table('Users')

# JWT Secret (should be stored in environment variables)
JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production'
JWT_EXPIRATION_HOURS = 24

def lambda_handler(event, context):
    """
    Lambda handler for user login
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Extract fields
        email = body.get('email', '').strip().lower()
        password = body.get('password', '')
        
        # Validate required fields
        errors = []
        if not email:
            errors.append('Email address is required')
        if not password:
            errors.append('Password is required')
        
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
        
        # Find user by email
        try:
            response = users_table.get_item(
                Key={'email': email}
            )
            
            if 'Item' not in response:
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': 'Invalid credentials'
                    })
                }
            
            user = response['Item']
            stored_password_hash = user.get('password_hash', '')
            
        except ClientError as e:
            print(f"DynamoDB error finding user: {e}")
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
        
        # Compare password with stored hash
        try:
            if not bcrypt.checkpw(password.encode('utf-8'), stored_password_hash.encode('utf-8')):
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS'
                    },
                    'body': json.dumps({
                        'success': False,
                        'error': 'Invalid credentials'
                    })
                }
        except Exception as e:
            print(f"Password verification error: {e}")
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
                    'error': 'Authentication failed'
                })
            }
        
        # Generate JWT token
        try:
            payload = {
                'user_id': user['user_id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
                'iat': datetime.utcnow()
            }
            
            token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
            
        except Exception as e:
            print(f"JWT generation error: {e}")
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
                    'error': 'Token generation failed'
                })
            }
        
        # Success response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Login successful',
                'token': token,
                'user': {
                    'user_id': user['user_id'],
                    'full_name': user['full_name'],
                    'email': user['email'],
                    'phone_number': user.get('phone_number')
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
