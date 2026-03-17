@echo off
setlocal
title Pagsanjan Solo Parent System Launcher
color 1F

:: ==========================================
:: 1. SET & CHECK DIRECTORY
:: ==========================================
cd /d "%~dp0"

if not exist "pagsanjan-backend" (
    color 4F
    echo [ERROR] CRITICAL FILE MISSING!
    echo.
    echo The "pagsanjan-backend" folder was not found.
    echo.
    echo Please make sure this file "Run_System.bat" is located inside the
    echo "solo_parent" folder of your project.
    echo.
    echo DO NOT copy this file to your Desktop. create a Shortcut instead.
    echo.
    pause
    exit /b
)

echo =========================================================
echo      Pagsanjan Solo Parent Information System
echo =========================================================
echo.

:: ==========================================
:: 2. CLEANUP OLD PROCESSES
:: ==========================================
echo [1/5] Stopping previous sessions...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM php.exe /T >nul 2>&1

:: ==========================================
:: 3. SETUP TOOLS (NODE.JS)
:: ==========================================
if exist "tools\node-v20.11.0-win-x64" (
    echo [INFO] Using portable Node.js...
    set "PATH=%~dp0tools\node-v20.11.0-win-x64;%PATH%"
)

:: ==========================================
:: 4. START XAMPP (DATABASE & SERVER)
:: ==========================================
echo.
echo [2/5] Starting XAMPP (Apache and MySQL)...

if exist "C:\xampp\mysql_start.bat" (
    start "XAMPP MySQL" /min "C:\xampp\mysql_start.bat"
) else (
    echo    [WARNING] MySQL start script not found. Please ensure MySQL is running.
)

if exist "C:\xampp\apache_start.bat" (
    start "XAMPP Apache" /min "C:\xampp\apache_start.bat"
) else (
    echo    [WARNING] Apache start script not found. Please ensure Apache is running.
)

timeout /t 5 /nobreak >nul

:: ==========================================
:: 5. START BACKEND (LARAVEL)
:: ==========================================
echo.
echo [3/5] Starting Backend Server (Port 8085)...
cd pagsanjan-backend

:: Check for PHP executable
if exist "c:\xampp\php\php.exe" (
    start "Laravel Backend" /min cmd /k "c:\xampp\php\php.exe artisan serve --port=8085 --host=127.0.0.1"
) else (
    echo    [INFO] Using system PHP
    start "Laravel Backend" /min cmd /k "php artisan serve --port=8085 --host=127.0.0.1"
)

cd ..
timeout /t 3 /nobreak >nul

:: ==========================================
:: 6. START FRONTEND (REACT)
:: ==========================================
echo.
echo [4/5] Starting Frontend Server (Port 5173)...
cd pagsanjan-frontend

:: First run check
if not exist "node_modules" (
    echo    [INFO] Installing frontend dependencies...
    call npm install
)

start "React Frontend" /min cmd /k "npm run dev"

cd ..

:: ==========================================
:: 7. LAUNCH BROWSER
:: ==========================================
echo.
echo [5/5] Launching Browser...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo =========================================================
echo           SYSTEM STARTED SUCCESSFULLY!
echo =========================================================
echo Backend URL:  http://localhost:8085
echo Frontend URL: http://localhost:5173
echo.
echo NOTE: Keep this window open or minimized.
echo       Closing it might stop the servers.
echo.
pause