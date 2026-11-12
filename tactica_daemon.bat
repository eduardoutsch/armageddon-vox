@echo off
setlocal
cd /d "%~dp0"
color 0A
title Segmentum Solar // In-Match LCT Tactical Daemon
echo ================================================================
echo  FIRES OF ARMAGEDDON // LCT TACTICA DAEMON ^& TTS BRIDGE
echo  Active Directory: %CD%
echo ================================================================

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in PATH! Please install Node.js 18+ to proceed.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not found in PATH! Please ensure Node.js/npm is installed.
    pause
    exit /b 1
)

if not exist "%~dp0.env" (
    if exist "%~dp0.env.example" (
        echo [NOTICE] .env file not detected. Creating .env from .env.example template...
        copy "%~dp0.env.example" "%~dp0.env" >nul
    )
)

if not exist "%~dp0node_modules\msedge-tts" call npm install

echo Launching In-Match LCT Tactical Daemon...
call npm run tactica:daemon
pause

