@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
cd /d "%~dp0"

rem ==== EE-Wiki: stop local server (5173 / 4173) ==================

set FOUND=0
for %%P in (5173 4173) do (
  for /f "tokens=5" %%i in ('netstat -ano ^| findstr ":%%P " ^| findstr "LISTENING"') do (
    echo [STOP] port %%P  -^>  PID %%i
    taskkill /PID %%i /F >nul 2>&1
    set FOUND=1
  )
)

if "%FOUND%"=="0" (
  echo [INFO] no running server found.
) else (
  echo [DONE] stopped.
)
timeout /t 2 >nul
