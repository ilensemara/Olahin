@echo off
title Olahin Dev Suite Manager
color 0A
echo =======================================================
echo          OLAHIN DEVELOPER SUITE MANAGER
echo =======================================================
echo.

REM ------------------------------------------------------------------
REM 0. Pre-flight: pastikan dependency & database Laravel siap
REM ------------------------------------------------------------------
echo [0/3] Mempersiapkan Laravel Backend...
cd /d "%~dp0backend"
IF NOT EXIST "vendor" (
  echo     - Menjalankan composer install...
  call composer install --no-interaction
) ELSE (
  echo     - vendor sudah ada, lewati composer install.
)
IF NOT EXIST ".env" (
  IF EXIST ".env.example" (
    echo     - Membuat .env dari .env.example...
    copy .env.example .env
    php artisan key:generate
  )
)
echo     - Migrasi & seed database...
php artisan migrate --seed --force

REM ------------------------------------------------------------------
REM 1. Start Laravel Backend (port 8000)
REM ------------------------------------------------------------------
echo.
echo [1/3] Starting Laravel Backend on http://0.0.0.0:8000 (Local Network) ...
start "Olahin Backend" cmd /k "cd /d "%~dp0backend" && php artisan serve --host=0.0.0.0 --port=8000"

REM ------------------------------------------------------------------
REM 2. Start AI Engine FastAPI (port 8001) - optional, fallback simulasi
REM ------------------------------------------------------------------
echo.
echo [2/3] Mencoba menyalakan AI Engine (FastAPI) di port 8001...
IF EXIST "%~dp0ai-engine\main.py" (
  start "Olahin AI Engine" cmd /k "cd /d "%~dp0ai-engine" && python -m uvicorn main:app --host 0.0.0.0 --port 8001"
) ELSE (
  echo     - Folder ai-engine tidak ditemukan, Laravel akan pakai fallback simulasi.
)

REM ------------------------------------------------------------------
REM 3. Start Vite Vue.js Dev Server
REM ------------------------------------------------------------------
echo.
echo [3/3] Starting Vite Vue.js Dev Server (Exposed on Local Network)...
start "Olahin Frontend (Web)" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host"


echo.
echo =======================================================
echo                 CARA MEMBUKA APLIKASI
echo =======================================================
echo Buka di BROWSER LAPTOP (paling mudah, semua fitur jalan):
echo    - Buka URL yang tertera di konsol Vite dev server:
echo      http://localhost:5173
echo    - Kamera  -> Pindai bahan tiruan interaktif di web
echo    - Voice   -> Rekam suara lewat mikrofon browser (Web Speech API)
echo    - Video   -> Putar langsung video YouTube dalam modal
echo.
echo =======================================================
echo.
pause

