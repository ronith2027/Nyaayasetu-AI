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
    echo Installing dependencies...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo npm install failed. Please check the error output above.
        popd
        pause
        exit /b 1
    )
)

call npm run dev

popd

pause