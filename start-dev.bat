@echo off
REM MeetLive Startup Script for Windows
REM This script will start all three servers in separate terminal windows

echo.
echo ========================================
echo   MeetLive - Multi-Server Startup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

REM Start Streaming Server
echo Starting Streaming Server (Port 4000)...
start cmd /k "cd streaming_server && npm run dev"
timeout /t 2 /nobreak

REM Start Backend Server
echo Starting Backend Server (Port 5000)...
start cmd /k "cd backend && npm run dev"
timeout /t 2 /nobreak

REM Start Frontend Server
echo Starting Frontend (Port 5173)...
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   All servers started!
echo ========================================
echo.
echo Services:
echo   - Streaming Server: http://localhost:4000
echo   - Backend Server:   http://localhost:5000
echo   - Frontend:         http://localhost:5173
echo.
echo Open your browser and navigate to:
echo   http://localhost:5173
echo.
pause
