#!/bin/bash

# Deployment script for AWS Lambda authentication functions

set -e

echo "🚀 Starting deployment of authentication backend..."

# Configuration
STACK_NAME="AuthBackend"
REGION="us-east-1"
TABLE_NAME="Users"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials are not configured. Please run 'aws configure' first."
    exit 1
fi

echo "📦 Packaging Lambda functions..."

# Create deployment package directory
mkdir -p deployment
cd deployment

# Copy Python files
cp ../signup.py .
cp ../login.py .
cp ../requirements.txt .

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt -t .

# Create zip files
echo "🗜️ Creating deployment packages..."
zip -r signup.zip signup.py requirements.txt
zip -r login.zip login.py requirements.txt

echo "🏗️ Deploying CloudFormation stack..."

# Deploy CloudFormation stack
aws cloudformation deploy \
    --template-file ../template.yaml \
    --stack-name $STACK_NAME \
    --parameter-overrides TableName=$TABLE_NAME \
    --capabilities CAPABILITY_IAM \
    --region $REGION

if [ $? -eq 0 ]; then
    echo "✅ CloudFormation stack deployed successfully!"
else
    echo "❌ Failed to deploy CloudFormation stack."
    exit 1
fi

# Get API Gateway URL
API_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text)

echo "🌐 API Gateway URL: $API_URL"

# Update Lambda functions
echo "🔄 Updating Lambda function code..."

# Get function names from CloudFormation
SIGNUP_FUNCTION=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`SignupFunction`].OutputValue' \
    --output text)

LOGIN_FUNCTION=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`LoginFunction`].OutputValue' \
    --output text)

# Update signup function
aws lambda update-function-code \
    --function-name $SIGNUP_FUNCTION \
    --zip-file fileb://signup.zip \
    --region $REGION

# Update login function
aws lambda update-function-code \
    --function-name $LOGIN_FUNCTION \
    --zip-file fileb://login.zip \
    --region $REGION

echo "✅ Lambda functions updated successfully!"

# Clean up
cd ..
rm -rf deployment

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Summary:"
echo "   - DynamoDB Table: $TABLE_NAME"
echo "   - API Gateway URL: $API_URL"
echo "   - Signup Endpoint: $API_URL/signup"
echo "   - Login Endpoint: $API_URL/login"
echo ""
echo "⚠️  Remember to:"
echo "   1. Update JWT_SECRET in Lambda environment variables"
echo "   2. Configure CORS on API Gateway if needed"
echo "   3. Test the endpoints"
echo ""
echo "🧪 Test commands:"
echo "   # Test signup:"
echo "   curl -X POST $API_URL/signup \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"full_name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\",\"confirm_password\":\"password123\"}'"
echo ""
echo "   # Test login:"
echo "   curl -X POST $API_URL/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"john@example.com\",\"password\":\"password123\"}'"
