@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js not found. Install Node 24 from https://nodejs.org and run again. & pause & exit /b 1)
node -e "require('robotjs');require('uiohook-napi')" 2>nul || (echo Installing dependencies... & npm install --omit=dev || (pause & exit /b 1))
npm start -- %*
pause
