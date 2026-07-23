@echo off
title Olahin Secure Mobile Preview Tunnel (SSH - No Time Limit)
color 0B
echo =======================================================
echo     OLAHIN MOBILE PREVIEW TUNNEL SETUP (NO TIME LIMIT)
echo =======================================================
echo.
echo Pastikan server backend dan frontend Olahin sudah menyala (lewat run_servers.bat).
echo.

REM 1. Periksa dan buat SSH Key jika belum ada
if not exist "%USERPROFILE%\.ssh\id_rsa" (
  echo SSH Key tidak ditemukan. Membuat kunci autentikasi baru...
  if not exist "%USERPROFILE%\.ssh" mkdir "%USERPROFILE%\.ssh"
  ssh-keygen -t rsa -b 2048 -N "" -f "%USERPROFILE%\.ssh\id_rsa"
  echo SSH Key berhasil dibuat!
  echo.
)

echo Sedang menghubungkan terowongan aman bebas batas waktu (Localhost.run)...
echo.
ssh -p 443 -o StrictHostKeyChecking=no -R 80:localhost:5173 nokey@ssh.localhost.run
pause
