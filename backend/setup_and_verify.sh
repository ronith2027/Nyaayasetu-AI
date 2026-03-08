#!/usr/bin/env bash
# ------------------------------------------------------------
# Automated setup for NyaayaSetu-AI backend authentication
# ------------------------------------------------------------
# This script will:
#   1. Install Python dependencies (requirements.txt)
#   2. Apply the auth_router patch (if not already applied)
#   3. Verify the file compiles with `python -m py_compile`
#   4. Optionally start the FastAPI server
# ------------------------------------------------------------
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# 1️⃣ Install dependencies
if command -v pip3 >/dev/null 2>&1; then
    echo "Installing Python dependencies..."
    pip3 install -r requirements.txt
else
    echo "pip3 not found – please install Python 3 and pip first."
    exit 1
fi

# 2️⃣ Apply the auth_router patch (idempotent)
PATCH_FILE="backend/auth_router.patch"
if [[ -f "$PATCH_FILE" ]]; then
    echo "Applying auth_router patch..."
    # `patch` returns non‑zero if the patch has already been applied; ignore that case
    patch -p0 < "$PATCH_FILE" || true
else
    echo "Patch file not found ($PATCH_FILE). Skipping patch step."
fi

# 3️⃣ Verify compilation
echo "Compiling auth_router.py to ensure syntax correctness..."
python3 -m py_compile backend/auth_router.py
echo "Compilation succeeded."

# 4️⃣ Optionally start the server (pass "run" as argument)
if [[ "${1:-}" == "run" ]]; then
    echo "Starting FastAPI server..."
    uvicorn backend.main:app --reload
else
    echo "Setup complete. To start the server, run: ./setup_and_verify.sh run"
fi
