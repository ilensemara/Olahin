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
echo [1/3] Starting Laravel Backend on http://127.0.0.1:8000 ...
start "Olahin Backend" cmd /k "cd /d "%~dp0backend" && php artisan serve --port=8000"

REM ------------------------------------------------------------------
REM 2. Start AI Engine FastAPI (port 8001) - optional, fallback simulasi
REM ------------------------------------------------------------------
echo.
echo [2/3] Mencoba menyalakan AI Engine (FastAPI) di port 8001...
IF EXIST "%~dp0ai-engine\main.py" (
  start "Olahin AI Engine" cmd /k "cd /d "%~dp0ai-engine" && python -m uvicorn main:app --host 127.0.0.1 --port 8001"
) ELSE (
  echo     - Folder ai-engine tidak ditemukan, Laravel akan pakai fallback simulasi.
)

REM ------------------------------------------------------------------
REM 3. Start Expo Metro Bundler (WEB mode - jalan di browser tanpa native module)
REM ------------------------------------------------------------------
echo.
echo [3/3] Starting Expo di MODE WEB (browser laptop)...
start "Olahin Frontend (Web)" cmd /k "cd /d "%~dp0frontend" && npx expo start --web"

echo.
echo =======================================================
echo                 CARA MEMBUKA APLIKASI
echo =======================================================
echo Buka di BROWSER LAPTOP (paling mudah, semua fitur jalan):
echo    - Expo otomatis buka browser; jika tidak, buka:
echo      http://localhost:8081  (atau tekan 'w' di jendela depan)
echo    - Kamera  -> pilih foto file (kamera HP tdk ada di web, galeri jalan)
echo    - Voice   -> rekam lewat mikrofon browser (MediaRecorder)
echo    - Video   -> langsung putar di browser
echo.
echo Kalau ingin di HP (Expo Go), tutup jendela ini lalu jalankan manual:
echo    cd frontend && npx expo start   (lalu scan QR, butuh dev build utk native)
echo.
echo =======================================================
echo                 TROUBLESHOOTING
echo =======================================================
echo - Backend error: pastikan PHP & Composer terpasang dan di PATH.
echo - AI engine mati: tidak masalah, Laravel pakai simulasi otomatis.
echo - Browser blank: buka http://localhost:8081 , atau restart skrip.
echo =======================================================
echo.
pause

