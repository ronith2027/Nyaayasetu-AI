@echo off
setlocal
echo ==========================================
echo       NyayaSetu AI - Windows Setup
echo ==========================================

REM Check for Node.js
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm could not be found. Please install Node.js (v20+).
    pause
    exit /b 1
)

REM Check for Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] python could not be found. Please install Python (v3.9+).
    pause
    exit /b 1
)

REM 1. Setup Python Backend
echo [1/3] Setting up Python backend...
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment and installing requirements...
call venv\Scripts\activate
pip install -r requirements.txt

echo Starting Python backend in new window...
start "Python Backend" cmd /c "call venv\Scripts\activate && cd backend && python main.py"

REM 2. Setup Node.js Backend
echo [2/3] Setting up Node.js backend...
pushd backend
if not exist node_modules (
    echo Installing Node backend dependencies...
    call npm install
)
echo Starting Node.js backend in new window...
start "Node Backend" cmd /k npm run dev
popd

REM 3. Setup Frontend
echo [3/3] Setting up Frontend...
pushd frontend
if not exist node_modules (
    echo Installing Frontend dependencies...
    call npm install --legacy-peer-deps
)

echo Starting Frontend...
echo Access the app at http://localhost:3000
call npm run dev
popd

pause
