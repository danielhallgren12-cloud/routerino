@echo off
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
cd /d "%~dp0backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
pause
