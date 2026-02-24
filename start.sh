#!/bin/bash
echo "Starting NyayaSetu-AI..."

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "npm could not be found. Please install Node.js."
    exit 1
fi

# Start frontend
echo "Starting frontend development server..."
cd frontend
npm run dev
