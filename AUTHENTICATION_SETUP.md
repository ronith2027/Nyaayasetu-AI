# Authentication and Microservices Setup Guide

## Overview

This guide explains the authentication system and microservices architecture implemented for NyayaSetu AI.

## Architecture

### Microservices

1. **Auth Service** - Handles user authentication, JWT tokens, and user management
2. **User Data Service** - Stores user-specific data and form inputs
3. **Search Service** - Integrates with AWS OpenSearch for vector search capabilities
4. **API Gateway** - Routes requests to appropriate microservices

### Database Structure

- **Auth Database** (`nyaaya_auth`): Stores user credentials
- **User Data Database** (`nyaaya_user_data`): Stores user form data and interactions
- **OpenSearch**: Stores vector embeddings for semantic search

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
```

#### Database Setup
```sql
-- Create Auth Database
CREATE DATABASE nyaaya_auth;

-- Create User Data Database  
CREATE DATABASE nyaaya_user_data;
```

#### AWS OpenSearch Setup
1. Create an AWS OpenSearch Service domain
2. Enable vector search capabilities
3. Update environment variables with your OpenSearch endpoint

#### Start Backend Server
```bash
npm run dev
```

### 2. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the .env.local file with your configuration
```

#### Start Frontend Server
```bash
npm run dev
```

## API Endpoints

### Authentication Service
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Authenticate user
- `POST /auth/logout` - Logout user
- `GET /auth/verify` - Verify JWT token

### User Data Service
- `POST /user-data/save` - Save user data
- `GET /user-data/:userId` - Get user data
- `PUT /user-data/update/:id` - Update user data
- `DELETE /user-data/delete/:id` - Delete user data
- `GET /user-data/summary/:userId` - Get user data summary

### Search Service
- `POST /search/store` - Store data with embeddings
- `POST /search/query` - Search using vector similarity
- `GET /search/user/:userId` - Get user's search data
- `DELETE /search/document/:documentId` - Delete search document
- `GET /search/health` - Check OpenSearch health

## Authentication Flow

1. **User Access**: When user first visits the website, they see a login/signup modal
2. **Authentication**: User logs in or signs up using email/password
3. **JWT Token**: Backend returns JWT token upon successful authentication
4. **Token Storage**: Token is stored in localStorage (consider HTTP-only cookies for production)
5. **Protected Routes**: All subsequent requests include JWT token in Authorization header
6. **Token Verification**: Middleware verifies token on protected routes

## Security Features

### Authentication
- JWT-based authentication
- Password hashing with bcrypt (12 salt rounds)
- Token expiration handling
- Automatic logout on token expiry

### Input Validation
- Email format validation
- Password length requirements (minimum 6 characters)
- SQL injection prevention through parameterized queries

### Rate Limiting
- Configurable rate limiting per endpoint
- Prevents brute force attacks
- Customizable time windows and request limits

## Environment Variables

### Backend (.env)
- `JWT_SECRET`: Secret key for JWT signing
- `AUTH_DB_*`: Auth service database configuration
- `USER_DATA_DB_*`: User data service database configuration
- `OPENSEARCH_*`: AWS OpenSearch configuration
- `AWS_*`: AWS credentials (if needed)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_*`: Public configuration variables

## Development Notes

### Database Connections
Each microservice uses its own database connection pool for isolation and scalability.

### Error Handling
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages for development

### Logging
- Comprehensive error logging
- Request/response logging for debugging
- Performance monitoring capabilities

## Production Considerations

1. **Security**:
   - Use HTTPS in production
   - Implement proper CORS configuration
   - Use HTTP-only cookies for JWT tokens
   - Enable rate limiting

2. **Database**:
   - Use connection pooling
   - Implement database backups
   - Consider read replicas for scaling

3. **OpenSearch**:
   - Configure proper access controls
   - Enable data encryption
   - Set up monitoring and alerts

4. **Deployment**:
   - Use environment-specific configurations
   - Implement health checks
   - Set up load balancing

## Testing

### Authentication Testing
```bash
# Test signup
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Protected Route Testing
```bash
# Test protected route with token
curl -X GET http://localhost:5000/user-data/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Common Issues
1. **Database Connection**: Check database credentials and network connectivity
2. **JWT Errors**: Verify JWT_SECRET is set correctly
3. **OpenSearch Connection**: Check AWS credentials and endpoint configuration
4. **CORS Issues**: Verify frontend and backend URLs in environment configuration

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and stack traces.
