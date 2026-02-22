#!/bin/bash

# MeetLive Startup Script for Mac/Linux
# This script will start all three servers in separate terminal windows (or tabs)

echo ""
echo "========================================"
echo "  MeetLive - Multi-Server Startup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "Node.js found: $(node --version)"
echo ""

# Function to run server in new terminal (for macOS)
run_in_terminal_mac() {
    local cmd=$1
    local name=$2
    osascript -e "tell application \"Terminal\"
        do script \"cd '$(pwd)' && $cmd\"
        set currentSettings to name of current settings of front window
    end tell" 2>/dev/null
}

# Function to run server in new terminal (for Linux)
run_in_terminal_linux() {
    local cmd=$1
    local name=$2
    
    # Try different terminal emulators
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "$cmd; bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "$cmd; bash" &
    else
        echo "No supported terminal found. Please run servers manually:"
        echo "Terminal 1: cd streaming_server && npm run dev"
        echo "Terminal 2: cd backend && npm run dev"
        echo "Terminal 3: cd frontend && npm run dev"
        exit 1
    fi
}

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo "Starting servers on macOS..."
    run_in_terminal_mac "cd streaming_server && npm run dev" "Streaming Server"
    sleep 2
    run_in_terminal_mac "cd backend && npm run dev" "Backend Server"
    sleep 2
    run_in_terminal_mac "cd frontend && npm run dev" "Frontend"
else
    # Linux
    echo "Starting servers on Linux..."
    run_in_terminal_linux "cd streaming_server && npm run dev" "Streaming Server" &
    sleep 2
    run_in_terminal_linux "cd backend && npm run dev" "Backend Server" &
    sleep 2
    run_in_terminal_linux "cd frontend && npm run dev" "Frontend" &
fi

echo ""
echo "========================================"
echo "  All servers starting!"
echo "========================================"
echo ""
echo "Services:"
echo "  - Streaming Server: http://localhost:4000"
echo "  - Backend Server:   http://localhost:5000"
echo "  - Frontend:         http://localhost:5173"
echo ""
echo "Open your browser and navigate to:"
echo "  http://localhost:5173"
echo ""
