@echo off
setlocal
echo Starting NyayaSetu-AI...

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo npm could not be found. Please install Node.js.
    pause
    exit /b 1
)

REM Start backend
echo Starting backend server...
start "Backend" /D "%~dp0backend" cmd /c "if not exist node_modules (npm install) & npm run dev"

REM Start frontend
echo Starting frontend development server...
pushd "%~dp0frontend"

if not exist package.json (
    echo package.json not found in frontend folder.
    popd
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installing dependencies for frontend...
    call npm install --legacy-peer-deps
)

call npm run dev
popd

pause