Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "      NyayaSetu AI - Windows Setup       " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check for Node.js
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] npm could not be found. Please install Node.js (v20+)." -ForegroundColor Red
    pause
    exit 1
}

# Check for Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] python could not be found. Please install Python (v3.9+)." -ForegroundColor Red
    pause
    exit 1
}

# 1. Setup Python Backend
Write-Host "[1/3] Setting up Python backend..." -ForegroundColor Yellow
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

Write-Host "Installing requirements..."
& .\venv\Scripts\python.exe -m pip install -r requirements.txt

Write-Host "Starting Python backend in new window..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; ..\venv\Scripts\python.exe main.py"

# 2. Setup Node.js Backend
Write-Host "[2/3] Setting up Node.js backend..." -ForegroundColor Yellow
pushd backend
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Node backend dependencies..."
    npm install
}
Write-Host "Starting Node.js backend in new window..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
popd

# 3. Setup Frontend
Write-Host "[3/3] Setting up Frontend..." -ForegroundColor Yellow
pushd frontend
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Frontend dependencies..."
    npm install --legacy-peer-deps
}

Write-Host "Starting Frontend..." -ForegroundColor Green
Write-Host "Access the app at http://localhost:3000"
npm run dev
popd
