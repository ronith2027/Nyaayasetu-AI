#!/bin/bash
echo "Starting NyayaSetu-AI..."

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "npm could not be found. Please install Node.js."
    exit 1
fi

# Start backend
echo "Starting Python backend..."
uvicorn backend.main:app --host 0.0.0.0 --port 8000 &

# Start frontend
echo "Starting frontend development server..."
cd frontend
npm run dev
