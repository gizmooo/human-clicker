@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js not found. Install Node 24 from https://nodejs.org and run again. & pause & exit /b 1)
for /f "tokens=1,2 delims=v." %%a in ('node -v') do (set MAJOR=%%a& set MINOR=%%b)
set OLD=0
if %MAJOR% LSS 22 set OLD=1
if %MAJOR% EQU 22 if %MINOR% LSS 18 set OLD=1
if %OLD%==1 (echo Node.js %MAJOR%.%MINOR% is too old, 22.18 or newer required. Install Node 24 from https://nodejs.org and run again. & pause & exit /b 1)
node -e "require('robotjs');require('uiohook-napi')" 2>nul || (echo Installing dependencies... & npm install --omit=dev || (pause & exit /b 1))
npm start -- %*
pause
