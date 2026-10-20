@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
cd /d "%~dp0"

rem ==== EE-Wiki launcher ==========================================
rem   double click      -> dev mode (hot reload)
rem   start.bat preview -> serve built static site (faster)
rem   start.bat build   -> build only
rem ================================================================

set "MODE=dev"
set "PORT=5173"
if /i "%~1"=="preview" ( set "MODE=preview" & set "PORT=4173" )
if /i "%~1"=="build"   ( set "MODE=build" )

type "%~dp0tools\banner.txt"

rem ---- 1. locate node.exe ----
rem 优先 PATH，其次常见安装位置（不硬编码用户名/路径）
set "NODE_EXE="
for /f "delims=" %%i in ('where node 2^>nul') do (
  if not defined NODE_EXE set "NODE_EXE=%%i"
)
if not defined NODE_EXE (
  if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
)
if not defined NODE_EXE (
  if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles(x86)%\nodejs\node.exe"
)
if not defined NODE_EXE (
  if exist "%LocalAppData%\Programs\nodejs\node.exe" set "NODE_EXE=%LocalAppData%\Programs\nodejs\node.exe"
)
if not defined NODE_EXE (
  echo [ERROR] node.exe not found. Install Node.js 20+ first.
  pause
  exit /b 1
)

rem ---- 2. ensure deps ----
if not exist "node_modules\vitepress\bin\vitepress.js" (
  echo [INFO] Installing dependencies, please wait 1-3 min ...
  call npm install --no-audit --no-fund --registry=https://registry.npmjs.org
  if errorlevel 1 (
    echo [ERROR] npm install failed. Run manually:
    echo         npm install --registry=https://registry.npmjs.org
    pause
    exit /b 1
  )
)

rem ---- 3. build only ----
if "%MODE%"=="build" (
  echo [BUILD] generating static site ...
  "%NODE_EXE%" "node_modules\vitepress\bin\vitepress.js" build docs
  echo [DONE] output: docs\.vitepress\dist
  pause
  exit /b 0
)

rem ---- 4. preview needs dist ----
if "%MODE%"=="preview" (
  if not exist "docs\.vitepress\dist\index.html" (
    echo [INFO] dist not found, building first ...
    "%NODE_EXE%" "node_modules\vitepress\bin\vitepress.js" build docs
    if errorlevel 1 ( echo [ERROR] build failed. & pause & exit /b 1 )
  )
)

rem ---- 5. already running? just open browser ----
netstat -ano | findstr ":%PORT% " | findstr "LISTENING" >nul
if %errorlevel%==0 (
  echo [INFO] port %PORT% is already serving, opening browser.
  start "" "http://localhost:%PORT%/"
  exit /b 0
)

echo.
echo   URL   : http://localhost:%PORT%/
echo   STOP  : close this window or press Ctrl+C
echo.

start "" cmd /c "timeout /t 5 >nul & start "" http://localhost:%PORT%/"

if "%MODE%"=="preview" (
  "%NODE_EXE%" "node_modules\vitepress\bin\vitepress.js" preview docs --port %PORT%
) else (
  "%NODE_EXE%" "node_modules\vitepress\bin\vitepress.js" dev docs --port %PORT%
)

pause
