@echo off
echo Starting Minesweeper Multiplayer Server...
echo.

REM Install dependencies if not already installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start the WebSocket server
echo Starting WebSocket server on port 3000...
start "Minesweeper Server" cmd /k "node server.js"

REM Wait a moment for server to start
timeout /t 2 /nobreak > nul

REM Start the game server
echo Starting game server on port 8000...
start "Minesweeper Game" cmd /k "python -m http.server 8000"

echo.
echo Servers started!
echo.
echo WebSocket Server: http://localhost:3000
echo Game Server: http://localhost:8000
echo.
echo Open http://localhost:8000 in your browser to play!
echo.
pause 