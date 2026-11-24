@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title KeyWarp Desktop - Typing Speed Test

echo ========================================================
echo   Starting KeyWarp Desktop (Pygame + Tkinter)
echo ========================================================
echo.

set "PY_CMD="

:: 1. Check user local Python installation (where pygame is installed)
if exist "%LOCALAPPDATA%\Python\bin\python.exe" (
    set "PY_CMD=%LOCALAPPDATA%\Python\bin\python.exe"
    goto :found
)

:: 2. Check standard Python install directories
for /d %%D in ("%LOCALAPPDATA%\Programs\Python\Python*") do (
    if exist "%%D\python.exe" (
        set "PY_CMD=%%D\python.exe"
        goto :found
    )
)
for /d %%D in ("C:\Python*") do (
    if exist "%%D\python.exe" (
        set "PY_CMD=%%D\python.exe"
        goto :found
    )
)

:: 3. Test python command in PATH
python -c "import sys; sys.exit(0)" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PY_CMD=python"
    goto :found
)

:: 4. Test py launcher
py -3 -c "import sys; sys.exit(0)" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PY_CMD=py -3"
    goto :found
)

py -c "import sys; sys.exit(0)" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "PY_CMD=py"
    goto :found
)

:found
if not defined PY_CMD (
    echo ========================================================
    echo   [Error] Python not found on your system.
    echo   Please install Python from https://www.python.org/
    echo ========================================================
    echo.
    pause
    exit /b 1
)

echo Using Python: !PY_CMD!
echo.

!PY_CMD! desktop\desktop_app.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================================
    echo   KeyWarp Desktop closed with an exit code: %ERRORLEVEL%
    echo   If pygame is missing, run:
    echo     !PY_CMD! -m pip install -r desktop\requirements.txt
    echo ========================================================
    echo.
    pause
)
