#!/usr/bin/env bash

# Unified dev helper for NyayaSetu-AI (Python-only backend)
# - Ensures frontend API URL points to FastAPI
# - Kills stray processes on dev ports
# - Starts FastAPI backend and Next.js frontend in watch/dev mode

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PYTHON_PORT="${PYTHON_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

echo "🔧 NyayaSetu-AI dev helper"
echo "  Python backend : ${PYTHON_PORT}"
echo "  Frontend       : ${FRONTEND_PORT}"
echo

kill_port() {
  local port="$1"
  if lsof -i ":${port}" >/dev/null 2>&1; then
    echo "⛔ Killing processes on port ${port}..."
    lsof -ti ":${port}" | xargs kill -9 || true
  else
    echo "✅ No process using port ${port}"
  fi
}

echo "▶ Ensuring no stale dev servers are running..."
kill_port "${PYTHON_PORT}"
kill_port "${FRONTEND_PORT}"

echo
echo "▶ Ensuring frontend .env.local exists and points to FastAPI..."
FRONTEND_DIR="${ROOT_DIR}/frontend"
ENV_EXAMPLE="${FRONTEND_DIR}/.env.example"
ENV_LOCAL="${FRONTEND_DIR}/.env.local"

mkdir -p "${FRONTEND_DIR}"

if [ -f "${ENV_LOCAL}" ]; then
  # Update or insert NEXT_PUBLIC_API_URL line
  if grep -q "^NEXT_PUBLIC_API_URL=" "${ENV_LOCAL}"; then
    sed -i.bak "s|^NEXT_PUBLIC_API_URL=.*$|NEXT_PUBLIC_API_URL=http://localhost:${PYTHON_PORT}|" "${ENV_LOCAL}"
    rm -f "${ENV_LOCAL}.bak"
    echo "✅ Updated NEXT_PUBLIC_API_URL in .env.local"
  else
    echo "NEXT_PUBLIC_API_URL=http://localhost:${PYTHON_PORT}" >> "${ENV_LOCAL}"
    echo "✅ Added NEXT_PUBLIC_API_URL to existing .env.local"
  fi
else
  if [ -f "${ENV_EXAMPLE}" ]; then
    cp "${ENV_EXAMPLE}" "${ENV_LOCAL}"
    sed -i.bak "s|^NEXT_PUBLIC_API_URL=.*$|NEXT_PUBLIC_API_URL=http://localhost:${PYTHON_PORT}|" "${ENV_LOCAL}"
    rm -f "${ENV_LOCAL}.bak"
    echo "✅ Created .env.local from .env.example and set NEXT_PUBLIC_API_URL"
  else
    cat > "${ENV_LOCAL}" <<EOF
NEXT_PUBLIC_API_URL=http://localhost:${PYTHON_PORT}
EOF
    echo "✅ Created minimal .env.local with NEXT_PUBLIC_API_URL"
  fi
fi

echo
echo "▶ Installing frontend dependencies if needed..."

cd "${ROOT_DIR}/frontend"
if [ ! -d "node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  npm install
fi

echo
echo "▶ Starting FastAPI backend and frontend..."

cd "${ROOT_DIR}/backend"
PYTHON_CMD="$(command -v python3 || command -v python)"
PYTHON_LOG="${ROOT_DIR}/backend/python_backend.log"
echo "🐍 Starting Python backend on port ${PYTHON_PORT} (logging to ${PYTHON_LOG})..."
"${PYTHON_CMD}" -m uvicorn main:app --host 0.0.0.0 --port "${PYTHON_PORT}" --reload > "${PYTHON_LOG}" 2>&1 &
PYTHON_PID=$!

cd "${ROOT_DIR}/frontend"
echo "💻 Starting frontend on port ${FRONTEND_PORT}..."
PORT="${FRONTEND_PORT}" npm run dev &
FRONTEND_PID=$!

cleanup() {
  echo
  echo "🛑 Stopping dev servers..."
  kill "${PYTHON_PID}" "${FRONTEND_PID}" 2>/dev/null || true
  wait "${PYTHON_PID}" "${FRONTEND_PID}" 2>/dev/null || true
}

trap cleanup SIGINT SIGTERM

wait
