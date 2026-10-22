@echo off
setlocal
cd /d "%~dp0"
color 0A
title Segmentum Solar // Dual-Thread Astropathic Courier
echo ================================================================
echo  ASTROPATHIC VOX-BRIDGE (SUPABASE ^<--^> GOOGLE ONE NOTEBOOK)
echo  Active Directory: %CD%
echo ================================================================

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in PATH! Please install Node.js 18+ to proceed.
    pause
    exit /b 1
)

if not exist "%~dp0.env" (
    if exist "%~dp0.env.example" (
        echo [NOTICE] .env file not detected. Creating .env from .env.example template...
        copy "%~dp0.env.example" "%~dp0.env" >nul
        echo [ACTION REQUIRED] Please edit .env with your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY!
    )
)

if not exist "%~dp0node_modules\playwright" (
    echo Installing Playwright and dotenv in current directory...
    call npm.cmd install playwright dotenv
    call npx.cmd playwright install chromium
)

echo Launching Dual-Thread Courier...
node "%~dp0vox_bridge.js"
pause