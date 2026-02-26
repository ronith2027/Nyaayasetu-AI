@echo off

echo ======================================
echo Setting up Python Backend
echo ======================================

cd backend

IF NOT EXIST venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate

echo Installing backend dependencies...
pip install -r requirements.txt

echo Starting Flask backend...
start "Flask Backend" cmd /k "cd /d %cd% && call venv\Scripts\activate && python app.py"

cd ..

echo ======================================
echo Setting up Frontend
echo ======================================

cd frontend

IF NOT EXIST node_modules (
    echo Installing frontend dependencies...
    npm install --legacy-peer-deps
)

echo Starting Next.js frontend...
start "NextJS Frontend" cmd /k "cd /d %cd% && npm run dev"

cd ..

echo ======================================
echo Backend and Frontend are starting...
echo ======================================

pause