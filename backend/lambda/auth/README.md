# Serverless Authentication Backend

AWS Lambda + DynamoDB authentication system with bcrypt password hashing and JWT tokens.

## 📁 Structure

```
lambda/auth/
├── signup.py          # User registration Lambda function
├── login.py           # User login Lambda function
├── requirements.txt    # Python dependencies
├── template.yaml       # CloudFormation deployment template
├── deploy.sh          # Deployment script
└── README.md          # This file
```

## 🚀 Quick Deployment

### Prerequisites
- AWS CLI installed and configured
- Python 3.9+
- Bash shell (for deploy script)

### Deploy with Script
```bash
cd backend/lambda/auth
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment
```bash
# 1. Deploy CloudFormation stack
aws cloudformation deploy \
    --template-file template.yaml \
    --stack-name AuthBackend \
    --parameter-overrides TableName=Users \
    --capabilities CAPABILITY_IAM \
    --region us-east-1

# 2. Update Lambda functions
# Package and upload signup.py and login.py to their respective Lambda functions
```

## 🔧 Configuration

### Environment Variables
- `JWT_SECRET`: Secret key for JWT token signing (change in production!)
- `TABLE_NAME`: DynamoDB table name (default: "Users")

### DynamoDB Table Schema
```json
{
  "user_id": "uuid-primary-key",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "password_hash": "bcrypt_hash",
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 📡 API Endpoints

### POST /signup
**Request:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "password": "password123",
  "confirm_password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "user_id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+1234567890"
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `409`: Email already exists
- `500`: Internal server error

### POST /login
**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "user_id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+1234567890"
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Invalid credentials
- `500`: Internal server error

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt (12 rounds)
- **JWT Authentication**: HMAC-SHA256 signed tokens
- **Input Validation**: Required fields and email format
- **Error Handling**: Comprehensive error responses
- **CORS Support**: Cross-origin requests enabled

## 🧪 Testing

### Test Signup
```bash
curl -X POST https://your-api-gateway-url/signup \
  -H 'Content-Type: application/json' \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+1234567890",
    "password": "password123",
    "confirm_password": "password123"
  }'
```

### Test Login
```bash
curl -X POST https://your-api-gateway-url/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 🔄 Frontend Integration

Update your frontend API calls to use the deployed API Gateway URLs:

```javascript
// Signup
const response = await fetch('https://your-api-gateway-url/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    full_name: name,
    email: email,
    phone_number: phone,
    password: password,
    confirm_password: confirmPassword
  })
});

// Login
const response = await fetch('https://your-api-gateway-url/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: email,
    password: password
  })
});
```

## ⚙️ Production Considerations

1. **Security**:
   - Change `JWT_SECRET` to a strong, random value
   - Enable AWS WAF on API Gateway
   - Use HTTPS only
   - Set up API throttling

2. **Monitoring**:
   - Enable CloudWatch logs for Lambda functions
   - Set up CloudWatch alarms
   - Monitor DynamoDB usage

3. **Scaling**:
   - DynamoDB auto-scaling enabled
   - Lambda provisioned concurrency if needed
   - API Gateway usage plans

## 🛠️ Local Development

### Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Run local tests
python -m pytest tests/
```

### Dependencies
- `bcrypt==4.0.1` - Password hashing
- `PyJWT==2.8.0` - JWT token generation
- `boto3==1.26.137` - AWS SDK
- `botocore==1.29.137` - AWS core libraries

## 📝 License

This code is part of the NyayaSetu AI project.
