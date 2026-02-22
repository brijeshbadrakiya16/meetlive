@echo off
REM Test Script for MeetLive Join Approval Flow
REM Run this in PowerShell or CMD in the workspace root

echo.
echo ========================================
echo MeetLive Multi-Server Test
echo ========================================
echo.
echo This script will:
echo 1. Start all 3 servers
echo 2. Show you port information
echo 3. Ask you to open browsers and test
echo.
echo IMPORTANT: Open this script output NEXT TO browser console (F12)
echo.
pause

echo.
echo === STEP 1: Starting Streaming Server ===
cd streaming_server
start "Streaming Server" cmd /k "npm run dev"
timeout /t 3
cd ..

echo.
echo === STEP 2: Starting Backend Server ===
cd backend
start "Backend Server" cmd /k "npm run dev"
timeout /t 3
cd ..

echo.
echo === STEP 3: Starting Frontend ===
cd frontend
start "Frontend Dev" cmd /k "npm run dev"
timeout /t 3
cd ..

echo.
echo ========================================
echo All servers started!
echo ========================================
echo.
echo SERVERS RUNNING ON:
echo   - Frontend:   http://localhost:5173
echo   - Backend:    http://localhost:4000
echo   - Streaming:  http://localhost:4001
echo.
echo ========================================
echo TEST PROCEDURE
echo ========================================
echo.
echo 1. Wait 5-10 seconds for all servers to fully start
echo.
echo 2. BROWSER 1 (HOST):
echo    - Open http://localhost:5173 in CHROME
echo    - Press F12 to open Developer Tools
echo    - Go to Console tab
echo    - Enter your name and click "+ Host a Meeting"
echo    - COPY THE MEETING CODE (e.g., ABC123)
echo    - Watch the console - should say "Host meeting started"
echo.
echo 3. BROWSER 2 (PARTICIPANT):
echo    - Open http://localhost:5173 in FIREFOX (different browser!)
echo    - Press F12 to open Developer Tools
echo    - Go to Console tab
echo    - Enter DIFFERENT name
echo    - Paste the meeting code and click "Join Meeting"
echo    - Watch console - should say "Waiting for host approval"
echo.
echo 4. BACK TO BROWSER 1:
echo    - Yellow button should show "1"
echo    - Click the yellow button
echo    - Modal opens with join request
echo    - Click "Approve"
echo    - CHECK BOTH CONSOLES FOR LOGS
echo.
echo ========================================
echo EXPECTED LOGS
echo ========================================
echo.
echo BROWSER 2 (Participant) after clicking approve:
echo   📨 [RECEIVED] join-approved {...}
echo   ✅✅✅ JOIN APPROVED - Setting isConnecting to FALSE
echo.
echo If you see BOTH of these = SUCCESS!
echo If participant still stuck = Check server logs below
echo.
echo ========================================
echo SERVER LOGS (Check terminal windows)
echo ========================================
echo.
echo Look for "🔵 APPROVE-JOIN" in Streaming Server terminal
echo Should show: Found: true and ✅✅✅ at the end
echo.
echo ========================================
echo NEED HELP?
echo ========================================
echo.
echo Read DEBUG_INFINITE_LOOP.md for detailed troubleshooting
echo.
pause
