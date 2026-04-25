@echo off
echo Starting LinkedIn AI Comment Backend...
echo.
cd /d "%~dp0"
npm install
echo.
echo Backend server starting on http://localhost:5000
echo.
node server.js
