# Auth Lambda README

## DynamoDB Table Schema (Users)
| Attribute | Type   | Description |
|-----------|--------|-------------|
| `email`   | String | **Partition key** – user e‑mail (lower‑cased). |
| `user_id` | Number | Unique numeric ID (timestamp‑based). |
| `name`    | String | Full name of the user. |
| `phone`   | String | Phone number. |
| `hashed_password` | String | SHA‑256 hash of the password (replace with bcrypt/argon2 in prod). |
| `created_at` | String (ISO‑8601) | Timestamp of creation. |

The table is created automatically by the SAM template (`template.yaml`).

## Example Frontend `fetch()` Calls (React)
```javascript
// utils/api.js – adjust BASE_URL to your deployed API Gateway endpoint
const BASE_URL = "https://<api-id>.execute-api.<region>.amazonaws.com/prod";

export async function signup({ name, email, phone, password }) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Signup failed");
  // Store JWT for later calls
  localStorage.setItem("jwt", data.token);
  return data;
}

export async function login({ email, password }) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  localStorage.setItem("jwt", data.token);
  return data;
}
```

## Deploy Workflow
The workflow file `.agents/workflows/deploy_auth_lambda.md` (already added) contains step‑by‑step commands to validate, build, package, and deploy the Lambda using AWS SAM.

## Local Development
If you want to test the Lambda locally, you can use SAM CLI:
```bash
sam local invoke AuthFunction -e events/signup_event.json
```
Create `events/signup_event.json` with the same shape as the API‑Gateway event.

---
*All code lives under `backend/lambda/` to keep it separate from the existing FastAPI service.*
