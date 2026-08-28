@echo off
title KeyWarp - Typing Speed Test & Analytics
echo Starting KeyWarp...
py -3.13 desktop_app.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Trying fallback Python launcher...
    py desktop_app.py
)
pause
