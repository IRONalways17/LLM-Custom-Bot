# Start all RAM Chatbot services

Write-Host "Starting RAM Chatbot Services..." -ForegroundColor Green

# Start Node.js service
Write-Host "Starting Node.js Gemini Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend-node; npm start"

Start-Sleep -Seconds 3

# Start Python API
Write-Host "Starting Python FastAPI..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend-python; D:/Internet/Bot/.venv/Scripts/python.exe main.py"

Start-Sleep -Seconds 3

# Start React frontend
Write-Host "Starting React Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "All services are starting..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Python API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Node.js Service: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
