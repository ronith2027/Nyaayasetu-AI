## NyayaSetu AI - Backend Documentation

### Overview

NyayaSetu AI uses a **Python-only backend** built on FastAPI.  
All core features are exposed directly from FastAPI:
- Authentication (`/auth/*`)
- User data storage and summaries (`/user-data/*`)
- Semantic search / RAG over user data (`/search/*`)
- AI features: chat, schemes, complaints, locator (`/chat`, `/schemes`, `/complaint`, `/locate`)
- Admin utilities for reviewing low-confidence responses (`/admin/*`)

The frontend (Next.js) talks directly to FastAPI (default: `http://localhost:8000` in development).

---

### 1. Technical Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Language**: Python 3.x (tested with the venv under `.venv/`)
- **Databases & Storage**:
  - **MySQL** via `mysql-connector-python`:
    - Auth DB (`auth_router.py`): users table with hashed passwords.
    - User Data DB (`user_data_router.py`): `misc_user_data` table for generic, tagged JSON.
  - **OpenSearch** via `opensearch-py`:
    - `search_router.py`: vector index for user-scoped semantic search.
- **AI / LLM**:
  - **Google Gemini** via `google-generativeai` (for chat, schemes, complaints).
  - Optional references to **AWS Bedrock** in some service modules (fallbacks provided if not configured).
- **Authentication**:
  - JWT tokens signed with `HS256` using a shared `JWT_SECRET`.
  - Tokens are decoded independently in `auth_router.py`, `user_data_router.py`, and `search_router.py`.

---

### 2. Resilience & Offline Mode

The backend is designed to keep the app usable even when external infrastructure (MySQL, OpenSearch, LLMs) is unavailable.

#### 2.1 Database Fallbacks

- **Auth (MySQL) → Memory**  
  If the MySQL auth pool cannot be created or accessed:
  - `auth_router.py` switches to an **in-memory user store** (`memory_users`).
  - Signup / login / verify still work, but all data is lost on restart.

- **User Data (MySQL) → Memory**  
  If the user-data pool or `misc_user_data` table cannot be initialized:
  - `user_data_router.py` uses **in-memory records** (`memory_user_data`).
  - Read/write semantics remain the same; persistence is lost on restart.

#### 2.2 Search Fallbacks

- **OpenSearch → In-Memory Search**  
  If OpenSearch is unavailable or the index cannot be created:
  - `search_router.py` switches to **memory mode** (`memory_docs`).
  - `/search/store` saves plain text + metadata in memory.
  - `/search/query` falls back to simple text matching on stored documents.

#### 2.3 AI Fallbacks

In all AI-heavy flows (chat, schemes, complaints, locator), if LLM calls fail or keys are missing:
- Services produce **heuristic / template-based responses** with safe defaults.
- This ensures the frontend experience remains functional even without external AI or data sources.

---

### 3. Architecture Diagram (Logical)

```text
[Frontend (Next.js, port 3000)]
       |
       v
[FastAPI Backend (main.py, port 8000)]
   |
   +--- /auth/*         (auth_router.py)
   +--- /user-data/*    (user_data_router.py)
   +--- /search/*       (search_router.py)
   +--- /chat           (functions/chat/services.py)
   +--- /schemes        (functions/scheme/services.py)
   +--- /complaint      (functions/complaint/services.py)
   +--- /locate         (functions/locator/services.py)
   +--- /admin/*        (inline handlers in main.py)
   |
   +--- External Services:
          - MySQL (Auth, User Data)
          - OpenSearch (Vector search)
          - Gemini / Bedrock (LLM)
```

In local development, `start.sh` and `dev.sh` start:
- FastAPI on `http://0.0.0.0:8000`
- Next.js dev server on `http://localhost:3000`

The frontend’s `NEXT_PUBLIC_API_URL` is automatically pointed at `http://localhost:8000` by these scripts.

---

### 4. Directory Structure (Backend)

- `backend/main.py`
  - FastAPI application entrypoint.
  - Mounts CORS middleware for dev.
  - Includes routers:
    - `auth_router` (`/auth/*`)
    - `user_data_router` (`/user-data/*`)
    - `search_router` (`/search/*`)
  - Exposes high-level AI endpoints:
    - `/chat`, `/schemes`, `/complaint`, `/locate`
    - `/admin/flagged`, `/admin/review` (mock admin APIs)

- `backend/auth_router.py`
  - Prefix: `/auth`, tag: `auth`.
  - Handles:
    - `POST /auth/signup`
    - `POST /auth/login`
    - `POST /auth/logout`
    - `GET /auth/verify`
  - Uses MySQL connection pool with automatic fallback to `memory_users` if the DB is unreachable.
  - Passwords are hashed with `bcrypt`.
  - JWTs are issued via `PyJWT` using `JWT_SECRET`.

- `backend/user_data_router.py`
  - Prefix: `/user-data`, tag: `user-data`.
  - Handles:
    - `POST /user-data/save`
    - `GET /user-data/{user_id}`
    - `PUT /user-data/update/{record_id}`
    - `DELETE /user-data/delete/{record_id}`
    - `GET /user-data/summary/{user_id}`
  - Relies on `misc_user_data` table for generic JSON storage (with indices on `email`, `data_type`, `state`).
  - Falls back to `memory_user_data` when MySQL is not available.
  - Enforces per-user isolation using JWT (`userId` in token must match path parameter).

- `backend/search_router.py`
  - Prefix: `/search`, tag: `search`.
  - Handles:
    - `POST /search/store`
    - `POST /search/query`
    - `GET /search/user/{user_id}`
    - `DELETE /search/document/{document_id}`
    - `GET /search/health`
  - Uses OpenSearch knn-vector index when available, with a random embedding generator (compatible with TS version).
  - Falls back to in-memory text records when OpenSearch fails.
  - All routes require a valid JWT and enforce per-user scoping.

- `backend/functions/`
  - Contains feature-specific logic shared conceptually with the old Node implementation:
    - `chat/` – context retrieval and answer generation for `/chat`.
    - `complaint/` – complaint drafting logic, sections, and formatting.
    - `scheme/` – welfare scheme matching and reasoning.
    - `locator/` – locating legal aid centers by pincode/state.
  - Python services in this folder are called from `main.py`.

- `backend/python_backend.log`
  - Log file for the FastAPI/Uvicorn process, written by `start.sh` / `dev.sh`.

---

### 5. API Reference

#### 5.1 Authentication (`/auth/*`)

**Base path**: `/auth`

Routes:

| Endpoint        | Method | Description                                      |
| :------------- | :----- | :----------------------------------------------- |
| `/auth/signup` | POST   | Register a new user (MySQL or in-memory).        |
| `/auth/login`  | POST   | Authenticate a user and return a JWT + user info.|
| `/auth/logout` | POST   | Stateless logout (client just drops the token).   |
| `/auth/verify` | GET    | Validate token and return `{ valid, user }`.      |

Notes:
- Email is validated with `EmailStr` (Pydantic) and `email-validator`.
- Password minimum length and basic checks enforced in `auth_router.py`.

#### 5.2 User Data (`/user-data/*`)

**Base path**: `/user-data`

Routes:

| Endpoint                          | Method | Description                                                          |
| :-------------------------------- | :----- | :------------------------------------------------------------------- |
| `/user-data/save`                 | POST   | Save JSON data with a `data_type` and optional `state`.             |
| `/user-data/{user_id}`           | GET    | Paginated list of records for the user, filterable by type/state.   |
| `/user-data/summary/{user_id}`   | GET    | Aggregated counts grouped by `data_type` and `state`.               |
| `/user-data/update/{record_id}`  | PUT    | Update `data` and optionally `state` for a record the user owns.    |
| `/user-data/delete/{record_id}`  | DELETE | Delete a record the user owns.                                      |

Security:
- All routes require `Authorization: Bearer <JWT>`.
- The `user_id` in the path must match the `userId` in the decoded JWT, or a `403` is returned.

#### 5.3 Search & RAG (`/search/*`)

**Base path**: `/search`

Routes:

| Endpoint                 | Method | Description                                                         |
| :----------------------- | :----- | :------------------------------------------------------------------ |
| `/search/store`          | POST   | Embed and store a text snippet for the current user.               |
| `/search/query`          | POST   | Semantic / vector search across the user’s stored documents.       |
| `/search/user/{user_id}` | GET    | Paginated list of stored documents for the user.                   |
| `/search/document/{id}`  | DELETE | Delete a stored document (enforces ownership via JWT).             |
| `/search/health`         | GET    | Health status of OpenSearch or memory mode.                        |

Security:
- All routes require a valid JWT.
- In OpenSearch mode, `user_id` is stored in the document and always filtered by that ID.

#### 5.4 AI Features (`/chat`, `/schemes`, `/complaint`, `/locate`, `/admin/*`)

**Core AI endpoints**:

| Endpoint          | Method | Description                                                   |
| :---------------- | :----- | :------------------------------------------------------------ |
| `/chat`           | POST   | Legal Q&A chat with optional PDF upload (multipart form).    |
| `/schemes`        | POST   | Suggests welfare schemes based on demographics + context.    |
| `/complaint`      | POST   | Generates a complaint draft and metadata from structured input. |
| `/locate`         | POST   | Finds legal aid centers / resources based on pincode/state.  |
| `/admin/flagged`  | GET/POST | Returns mock list of low-confidence responses for review. |
| `/admin/review`   | POST   | Mock endpoint to mark a flagged item as approved/rejected.   |

Notes:
- These endpoints rely on `functions/*/services.py` and internal heuristics for fallbacks.
- Response shapes are aligned with the existing Next.js frontend expectations.

---

### 6. Security & Middleware

- **JWT Authentication**:
  - Tokens are created in `auth_router.py` and verified in `auth_router.py`, `user_data_router.py`, and `search_router.py`.
  - Invalid or missing tokens produce `401` errors; cross-user access returns `403`.

- **CORS**:
  - `main.py` configures `CORSMiddleware` with `allow_origins=["*"]`, `allow_methods=["*"]`, and `allow_headers=["*"]` for development.
  - This allows the Next.js dev server (`localhost:3000`) and LAN devices to call the backend without CORS issues.

- **Error Handling**:
  - Uses FastAPI’s `HTTPException` to return structured error responses with proper status codes.
  - Database and OpenSearch errors are caught and mapped to `500` with safe messages, while logging details to stdout / `python_backend.log`.

---

### 7. Environment & Local Setup

#### 7.1 Python Environment

Recommended local setup:

```bash
cd /Users/saiabhinav/Desktop/NyaayaSetu-AI

python3 -m venv .venv
source .venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
```

Key packages (see `requirements.txt`):
- `fastapi`, `uvicorn[standard]`, `pydantic`, `python-multipart`
- `mysql-connector-python`, `opensearch-py`, `bcrypt`, `PyJWT`
- `google-generativeai`, `python-dotenv`, `requests`, etc.

#### 7.2 Environment Variables

Set these in your backend environment (e.g., `.env` loaded by `python-dotenv`):

- **Auth DB (MySQL)**:
  - `AUTH_DB_HOST`
  - `AUTH_DB_USER`
  - `AUTH_DB_PASSWORD`
  - `AUTH_DB_NAME` (default `nyaaya_auth`)

- **User Data DB (MySQL)**:
  - `USER_DATA_DB_HOST`
  - `USER_DATA_DB_USER`
  - `USER_DATA_DB_PASSWORD`
  - `USER_DATA_DB_NAME` (default `nyaaya_user_data`)

- **OpenSearch**:
  - `OPENSEARCH_ENDPOINT` (e.g. `https://localhost:9200`)
  - `OPENSEARCH_USERNAME`
  - `OPENSEARCH_PASSWORD`
  - `OPENSEARCH_INDEX` (default `user-data-vectors`)
  - `EMBEDDING_DIMENSION` (default `1536`)

- **Auth & Security**:
  - `JWT_SECRET` – secret used for signing/verifying JWTs.

- **AI Providers**:
  - `GEMINI_API_KEY` – Google Gemini API key.
  - (Optional) Any Bedrock-related keys/endpoints used by the chat services.

On the frontend side, `NEXT_PUBLIC_API_URL` is managed by `start.sh` / `dev.sh` and normally set to:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

This ensures all frontend API calls go directly to the FastAPI backend.
