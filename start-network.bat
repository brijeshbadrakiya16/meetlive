@echo off
REM Start MeetLive Application in Network Mode (accessible from mobile/other devices)
REM This script starts all three servers with network accessibility

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   MeetLive - Network Mode Startup
echo ============================================
echo.

REM Get local IP
for /f "delims=" %%A in ('powershell -Command "([System.Net.Dns]::GetHostEntry([System.Net.Dns]::GetHostName()).AddressList | Where-Object {$_.AddressFamily -eq 'InterNetwork'} | Select-Object -First 1).IPAddressToString"') do set "LOCAL_IP=%%A"

if "!LOCAL_IP!"=="" set "LOCAL_IP=localhost"

echo Local Machine IP: !LOCAL_IP!
echo.

REM Start Streaming Server
echo Starting Streaming Server (Port 4000)...
start "Streaming Server" cmd /k "cd streaming_server && npm run dev"
timeout /t 2 /nobreak > nul

REM Start Backend Server
echo Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 2 /nobreak > nul

REM Start Frontend Server with network access
echo Starting Frontend Server (Port 5173)...
echo Network URL: http://!LOCAL_IP!:5173
echo.
start "Frontend Server" cmd /k "cd frontend && npm run dev -- --host"

echo.
echo ============================================
echo   Servers Started!
echo ============================================
echo.
echo Access the application:
echo   Local:   http://localhost:5173
echo   Network: http://!LOCAL_IP!:5173
echo.
echo To connect from mobile:
echo   1. Make sure mobile is on same WiFi
echo   2. Open: http://!LOCAL_IP!:5173
echo   3. Ensure socket server runs on same machine
echo.
timeout /t 5 /nobreak > nul

