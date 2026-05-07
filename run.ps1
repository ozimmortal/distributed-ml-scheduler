# run.ps1 - Automation script for Distributed ML Scheduler
# This version uses ASCII only to avoid encoding issues on some Windows systems.

$ErrorActionPreference = "Stop"

Write-Host "--- Starting Distributed ML Scheduler Setup ---" -ForegroundColor Cyan

# 1. Environment Configuration
if (-not (Test-Path ".env")) {
    Write-Host "Config: .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
    } else {
        # Fallback if .env.example is missing
        "REDIS_HOST=localhost`nREDIS_PORT=6379`nDATABASE_URL=postgres://postgres:postgres@localhost:5433/scheduler`nQUEUE_NAME=ml-tasks" | Out-File -FilePath ".env" -Encoding ascii
    }
    Write-Host "Success: .env created." -ForegroundColor Green
}

# Load .env into current session
Get-Content .env | ForEach-Object {
    if ($_ -match '^(.*?)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($Matches[1], $Matches[2])
    }
}

# 2. Infrastructure Startup
Write-Host "Infra: Starting Postgres and Redis via Docker..." -ForegroundColor Cyan
docker compose up -d postgres redis

Write-Host "Status: Waiting for database and redis to be ready (10s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 3. Dependency Installation
Write-Host "Deps: Installing dependencies with Bun..." -ForegroundColor Cyan
bun install

# 4. Database Migrations
Write-Host "DB: Syncing database schema (push)..." -ForegroundColor Cyan
# Force use the DATABASE_URL we just loaded
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:5433/scheduler"
bun run db:push

# 5. Execution
Write-Host "Ready: Starting all services (Gateway, Scheduler, Worker, Frontend)..." -ForegroundColor Green
Write-Host "Tip: Press Ctrl+C to stop all services." -ForegroundColor Gray
Write-Host "Tip: Frontend is now at http://localhost:3005" -ForegroundColor Cyan
Write-Host "Tip: Ensure you have Python installed with 'pip install scikit-learn' for the worker." -ForegroundColor Yellow

# Use bun x concurrently to run all dev scripts defined in package.json
bun run dev:all
