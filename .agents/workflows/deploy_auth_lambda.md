---
description: Deploy Auth Lambda (SAM) – build, package, and deploy
---
# Deploy Auth Lambda using AWS SAM

1. **Prerequisites**
   - Install AWS CLI and configure credentials (`aws configure`).
   - Install SAM CLI (`brew install aws/tap/aws-sam-cli` on macOS).
   - Ensure Python 3.11 is available.

2. **Validate the SAM template**
   ```bash
   sam validate -t template.yaml
   ```
   // turbo

3. **Build the application**
   ```bash
   sam build
   ```
   // turbo

4. **Package and upload to an S3 bucket** (replace `<bucket-name>` with your bucket):
   ```bash
   sam package \
       --output-template-file packaged.yaml \
       --s3-bucket <bucket-name>
   ```
   // turbo

5. **Deploy the stack**
   ```bash
   sam deploy \
       --template-file packaged.yaml \
       --stack-name NyaayaSetuAuthStack \
       --capabilities CAPABILITY_IAM \
       --parameter-overrides JwtSecret=$(openssl rand -hex 32)
   ```
   // turbo

6. **Verify deployment**
   - After deployment, the output `ApiEndpoint` will be printed.
   - Test the signup endpoint with `curl`:
     ```bash
     curl -X POST "$ApiEndpoint/auth/signup" \
          -H "Content-Type: application/json" \
          -d '{"name":"Alice","email":"alice@example.com","phone":"1234567890","password":"secret123"}'
     ```
   - Test the login endpoint similarly.

7. **Cleanup** (optional)
   ```bash
   aws cloudformation delete-stack --stack-name NyaayaSetuAuthStack
   ```

---

**Notes**
- The Lambda uses a simple SHA‑256 password hash; replace with `bcrypt` or `argon2` for production.
- Set `AUTH_USE_DYNAMODB=1` in your `.env` (already present) to ensure the FastAPI router also uses DynamoDB if you keep it.
- The SAM template creates the `Users` DynamoDB table; you can adjust the table name via the `DYNAMODB_TABLE_USERS` environment variable.
