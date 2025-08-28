@echo off
echo Starting RAM Chatbot Services...
echo.

echo Starting Node.js Gemini Service...
start "Node.js Service" cmd /k "cd backend-node && npm start"

timeout /t 3 /nobreak > nul

echo Starting Python FastAPI...
start "Python API" cmd /k "cd backend-python && D:/Internet/Bot/.venv/Scripts/python.exe main.py"

timeout /t 3 /nobreak > nul

echo Starting React Frontend...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All services are starting...
echo Frontend: http://localhost:3000
echo Python API: http://localhost:8000
echo Node.js Service: http://localhost:3001
echo.
echo Press any key to exit...
pause > nul
