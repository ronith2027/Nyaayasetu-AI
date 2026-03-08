# NyayaSetu AI – Database Schema

This document defines the relational database schema and search index structure used by the NyayaSetu AI backend.  
It is suitable as a reference when provisioning databases on AWS (e.g., RDS MySQL and OpenSearch).

---

## 1. Overview

- **Relational Databases (MySQL)**  
  - `nyaaya_auth` – authentication and user accounts  
  - `nyaaya_user_data` – user interaction and legal journey data

- **Search Index (OpenSearch)**  
  - `user-data-vectors` – semantic search over user-associated text

---

## 2. Authentication Database – `nyaaya_auth`

### 2.1 Purpose

Stores registered users and their hashed passwords for the Node.js Auth Service.

### 2.2 Schema

```sql
CREATE DATABASE IF NOT EXISTS nyaaya_auth
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nyaaya_auth;

CREATE TABLE IF NOT EXISTS users (
  email VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL AUTO_INCREMENT UNIQUE,
  hashed_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.3 Notes

- **Email is the primary key** for the user table (natural key).
- `user_id` is an auto-incremented surrogate key kept for internal use and backwards compatibility with existing code.
- Passwords are stored as **bcrypt hashes** (12 salt rounds).
- JWT payload uses `userId` (from `users.user_id`) and `email`.
- The Auth service expects MySQL connection parameters via:
  - `AUTH_DB_HOST`
  - `AUTH_DB_USER`
  - `AUTH_DB_PASSWORD`
  - `AUTH_DB_NAME` (default: `nyaaya_auth`)

---

## 3. User Data Database – `nyaaya_user_data`

### 3.1 Purpose

Persists feature-specific data for each user.  
Instead of a single generic `user_data` table, data is split into multiple tables, each tied to a user via **email**.

### 3.2 Schema (per feature)

```sql
CREATE DATABASE IF NOT EXISTS nyaaya_user_data
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nyaaya_user_data;

-- 1) User profile / basic info
CREATE TABLE IF NOT EXISTS user_profiles (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(32),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  CONSTRAINT fk_profiles_user
    FOREIGN KEY (email) REFERENCES nyaaya_auth.users(email)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) Complaint feature – complaint drafts and submitted cases
CREATE TABLE IF NOT EXISTS complaint_cases (
  complaint_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  status VARCHAR(50),             -- e.g. 'draft', 'submitted', 'resolved'
  payload JSON NOT NULL,          -- full complaint form / AI-generated draft
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status),
  CONSTRAINT fk_complaints_user
    FOREIGN KEY (email) REFERENCES nyaaya_auth.users(email)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Scheme feature – discovered / applied welfare schemes
CREATE TABLE IF NOT EXISTS scheme_applications (
  scheme_app_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  scheme_code VARCHAR(100),       -- identifier of the scheme
  status VARCHAR(50),             -- e.g. 'interested', 'applied', 'approved'
  payload JSON NOT NULL,          -- answers, eligibility details, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_scheme_code (scheme_code),
  INDEX idx_status (status),
  CONSTRAINT fk_schemes_user
    FOREIGN KEY (email) REFERENCES nyaaya_auth.users(email)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4) Locator feature – nearest legal aid / police station lookups
CREATE TABLE IF NOT EXISTS locator_requests (
  locator_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  query JSON NOT NULL,            -- location, category of help, filters
  result JSON,                    -- resolved coordinates / institutions
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  CONSTRAINT fk_locator_user
    FOREIGN KEY (email) REFERENCES nyaaya_auth.users(email)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5) Chat feature – high-level chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  session_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  topic VARCHAR(255),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                     ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  CONSTRAINT fk_chat_sessions_user
    FOREIGN KEY (email) REFERENCES nyaaya_auth.users(email)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6) Chat feature – individual messages per session
CREATE TABLE IF NOT EXISTS chat_messages (
  message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id BIGINT NOT NULL,
  sender ENUM('user','assistant') NOT NULL,
  content TEXT NOT NULL,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session_id (session_id),
  CONSTRAINT fk_chat_messages_session
    FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7) Optional: miscellaneous user data not covered above
CREATE TABLE IF NOT EXISTS misc_user_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  data_type VARCHAR(50) NOT NULL,
  data JSON NOT NULL,
  state VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_data_type (data_type),
  INDEX idx_state (state),
  CONSTRAINT fk_misc_user
    FOREIGN KEY (email) REFERENCES nyaaya_auth.users(email)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.3 Notes

- Each **feature** gets its own table, all linked back to `nyaaya_auth.users` via the **email** column.
- JSON columns (`payload`, `data`, `metadata`) keep the design flexible while still separating features.
- You can extend this with additional tables per feature (e.g. audit logs) using the same pattern.

### 3.4 Environment Variables

- `USER_DATA_DB_HOST`
- `USER_DATA_DB_USER`
- `USER_DATA_DB_PASSWORD`
- `USER_DATA_DB_NAME` (default: `nyaaya_user_data`)

---

## 4. OpenSearch Index – `user-data-vectors`

> This section is relevant when provisioning an **AWS OpenSearch Service** domain.

### 4.1 Purpose

Stores vector embeddings for user-associated text so that the Search Service can perform semantic search.

### 4.2 Index Name

- Default index name: **`user-data-vectors`**  
  (configurable via `OPENSEARCH_INDEX`)

### 4.3 Mapping (Conceptual)

The Node service creates the index with the following mapping (simplified from code):

```json
{
  "settings": {
    "index": {
      "knn": true,
      "knn.algo_param.ef_search": 512
    }
  },
  "mappings": {
    "properties": {
      "user_id":   { "type": "keyword" },
      "data_type": { "type": "keyword" },
      "text":      { "type": "text" },
      "embedding": {
        "type": "knn_vector",
        "dimension": 1536,
        "method": {
          "name": "hnsw",
          "space_type": "cosinesimil",
          "engine": "nmslib",
          "parameters": {
            "ef_construction": 512,
            "m": 16
          }
        }
      },
      "created_at": { "type": "date" },
      "metadata":   { "type": "object" }
    }
  }
}
```

> Note: `dimension` is controlled by `EMBEDDING_DIMENSION` (default `1536`).  
> If you use a different embedding model, update this accordingly.

### 4.4 Environment Variables

- `OPENSEARCH_ENDPOINT` – OpenSearch cluster URL (e.g., `https://your-domain.region.es.amazonaws.com`)
- `OPENSEARCH_USERNAME`, `OPENSEARCH_PASSWORD`
- `OPENSEARCH_INDEX` (optional, default: `user-data-vectors`)
- `EMBEDDING_DIMENSION` (optional, default: `1536`)

---

## 5. Recommended AWS Setup

### 5.1 RDS MySQL

1. Create an RDS MySQL instance.
2. Run the SQL from sections **2** and **3** to create:
   - Database `nyaaya_auth` with table `users`
   - Database `nyaaya_user_data` with tables:
     - `user_profiles`
     - `complaint_cases`
     - `scheme_applications`
     - `locator_requests`
     - `chat_sessions`
     - `chat_messages`
     - `misc_user_data`
3. Configure backend environment variables to point to RDS:
   - `AUTH_DB_HOST`, `AUTH_DB_USER`, `AUTH_DB_PASSWORD`, `AUTH_DB_NAME`
   - `USER_DATA_DB_HOST`, `USER_DATA_DB_USER`, `USER_DATA_DB_PASSWORD`, `USER_DATA_DB_NAME`

### 5.2 OpenSearch Service

1. Create an AWS OpenSearch domain with vector search enabled.
2. Configure:
   - `OPENSEARCH_ENDPOINT`
   - `OPENSEARCH_USERNAME`, `OPENSEARCH_PASSWORD`
3. Optionally pre-create the index `user-data-vectors` using the mapping in **4.3**, or let the Node service auto-create it on startup.

---

## 6. Relations and Logical Model

- `nyaaya_auth.users.email` ↔ `nyaaya_user_data.*.email` (enforced via foreign keys).
- `chat_sessions.session_id` ↔ `chat_messages.session_id`.
- Each search document in `user-data-vectors` is associated with:
  - `user_id` – matching the auth user (numeric `user_id` from `users`)
  - `data_type` – can mirror feature categories (e.g. `complaint`, `scheme`, `chat`)
  - `metadata` – can contain references to per-feature table IDs (e.g. `complaint_id`).

This schema ensures a clean separation of concerns:
- **Auth DB** for credentials and identity (email as primary key)
- **User Data DB** for structured, per-feature legal journey data
- **OpenSearch** for semantic retrieval over user-specific text

