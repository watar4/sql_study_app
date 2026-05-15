@echo off
cd /d "%~dp0"
echo ============================================
echo   BigQuery SQL Study App - Local Server
echo ============================================
echo URL: http://localhost:8765
echo.
echo Press Ctrl+C in this window to stop.
echo.

where py >nul 2>nul
if %errorlevel%==0 goto run_py

where python >nul 2>nul
if %errorlevel%==0 goto run_python

where npx >nul 2>nul
if %errorlevel%==0 goto run_npx

echo [ERROR] Python or Node.js not found.
echo Install Python: https://www.python.org/downloads/
pause
goto :eof

:run_py
start "" http://localhost:8765
py -m http.server 8765
goto :eof

:run_python
start "" http://localhost:8765
python -m http.server 8765
goto :eof

:run_npx
start "" http://localhost:8765
npx --yes http-server -p 8765 -c-1 .
goto :eof
