# Olahin - Resep Pintar & Pelacak Gizi (PWA)

Olahin adalah platform manajemen resep pintar dan pelacak gizi berbasis stok kulkas pengguna yang dirancang dengan antarmuka responsif **Mobile-First (mockup smartphone)** bernuansa alam (Zaitun/Olive Green). Aplikasi ini dibangun dengan arsitektur terpisah (decoupled client-server) berbasis **Progressive Web App (PWA)** sehingga dapat diinstal secara mandiri di Android/iOS dan memiliki dukungan *offline caching*.

---

## 📋 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Spesifikasi Teknis (Tech Stack)](#-spesifikasi-teknis-tech-stack)
3. [Arsitektur Sistem](#-arsitektur-sistem)
4. [Instalasi & Pengoperasian Lokal](#%EF%B8%8F-instalasi--pengoperasian-lokal)
5. [Panduan Hosting & Deployment](#%EF%B8%8F-panduan-hosting--deployment)

---

## ✨ Fitur Utama

*   **Pencatat Bahan Kulkas**: CRUD bahan makanan, kategori (Protein, Sayuran, Bumbu, dll.), dan indikator kesegaran (hari menuju kadaluarsa).
*   **Input Suara AI & Kamera**: Menambah bahan kulkas cerdas menggunakan mikrofon (Web Speech API) dan streaming kamera (WebRTC) dengan laser pemindai neon.
*   **Rekomendasi Resep Cerdas**: Algoritma pencocokan bahan kulkas (kesesuaian minimal 50%) diurutkan dari persentase kecocokan tertinggi.
*   **Wizard Memasak Interaktif**: Panduan memasak langkah-demi-langkah dengan panel hijau zaitun, countdown timer, dan video tutorial YouTube.
*   **Pelacak Gizi Melingkar**: Visualisasi sisa target kalori harian, diagram makronutrisi (karbohidrat, protein, lemak), dan grafik tren mingguan kalori.

---

## 🛠️ Spesifikasi Teknis (Tech Stack)

### 1. Frontend (Client)
*   **Framework**: Vue.js 3 (Single Page Application - SPA)
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS v4 (menggunakan konfigurasi `@theme` modern di CSS)
*   **State Management**: Pinia (menyimpan data ke `localStorage` untuk offline fallback)
*   **HTTP Client**: Axios
*   **PWA Engine**: `vite-plugin-pwa` (Service Worker menggunakan Workbox untuk caching aset & API)

### 2. Backend (API)
*   **Framework**: Laravel PHP v10/v11
*   **Authentication**: Laravel Sanctum (Token-based API authentication)
*   **Database**: SQLite (lokal & ringan) / MySQL (produksi)
*   **ORM**: Eloquent ORM

### 3. AI Engine (Microservice)
*   **Framework**: FastAPI (Python 3.10+)
*   **Libraries**: NumPy, Uvicorn
*   **APIs**: Google Cloud Vision API, Clarifai API, AssemblyAI

---

## 🏗️ Arsitektur Sistem

Aplikasi menggunakan arsitektur **Decoupled SPA PWA** di mana Frontend Vue.js berjalan di sisi klien secara independen dan berkomunikasi dengan Laravel Backend API via request HTTPS/JSON. AI Engine FastAPI dipanggil oleh Laravel secara internal untuk mendeteksi bahan makanan dari gambar/suara.

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Frontend PWA)                  │
│  Vue.js 3 + Vite + Tailwind CSS v4 + Pinia (Port: 5173)         │
│  - WebRTC Camera Stream (Pindai Bahan real-time)                │
│  - Web Speech API (Perekaman suara & pengenalan kata kunci AI)  │
│  - Service Worker Caching (Workbox SW: Stale-While-Revalidate)  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS / JSON REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (Backend Server)                   │
│  Laravel PHP Framework (Port: 8000)                             │
│  - Restful endpoints (Autentikasi Sanctum, CRUD Bahan, Resep)   │
│  - Algoritma Matching Resep & Pencatatan Kalori Harian          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                               │
│  SQLite / MySQL                                                 │
│  Tabel: users, ingredients, recipes, recipe_steps, daily_logs   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Instalasi & Pengoperasian Lokal

### Prasyarat (Prerequisites)
Pastikan komputer Anda sudah terinstal:
*   [PHP 8.1 / 8.2+](https://www.php.net/downloads.php)
*   [Composer](https://getcomposer.org/)
*   [Node.js 18+](https://nodejs.org/)
*   [Python 3.10+](https://www.python.org/) (Opsional, untuk AI Engine)

### Cara Menjalankan Aplikasi
1. Clone repositori ini ke komputer lokal Anda.
2. Cukup jalankan file skrip otomatis **[run_servers.bat](file:///c:/Olahin/run_servers.bat)** di sistem operasi Windows.
3. Skrip ini akan melakukan:
    *   Menginstal dependensi PHP via Composer di folder `backend/`.
    *   Membuat berkas `.env` dan men-generate `APP_KEY` Laravel jika belum ada.
    *   Menjalankan migrasi database SQLite beserta pengisian data seeder contoh.
    *   Menyalakan server Laravel Backend di port 8000.
    *   Menyalakan AI Engine FastAPI di port 8001 (jika Python terinstal).
    *   Menginstal dependensi NPM dan menyalakan Vite Dev Server di port 5173.
4. Buka browser dan arahkan ke alamat **`http://localhost:5173`**.

---

## 🚀 Panduan Hosting & Deployment

Untuk mendeploy Olahin agar bisa diakses di internet secara publik dan berfungsi sebagai PWA yang dapat diinstal, ikuti syarat dan opsi hosting berikut:

### 🔒 Syarat Mutlak PWA: HTTPS
PWA mewajibkan penggunaan protokol aman (**HTTPS / SSL**). Service Worker tidak akan aktif jika dideploy menggunakan HTTP biasa (kecuali saat pengembangan di `localhost`).

### Opsi Hosting yang Tersedia

#### Opsi A: Single VPS Ubuntu & Nginx (Direkomendasikan & Hemat Biaya)
Menyatukan semua service ke dalam satu server VPS (Ubuntu).
1.  **Instalasi**: Install PHP, Composer, Node.js, Nginx, dan MySQL pada server VPS Anda.
2.  **Deploy Backend & AI Engine**: Clone repositori Anda di VPS. Jalankan FastAPI sebagai background service menggunakan systemd di port 8001. Konfigurasikan Laravel `.env` di mode produksi.
3.  **Build Frontend**: Di dalam folder `frontend/`, jalankan `npm run build` dan arahkan *root public directory* Nginx ke folder `frontend/dist/`.
4.  **Reverse Proxy**: Konfigurasikan Nginx agar meneruskan request `/api/*` ke backend Laravel.
5.  **SSL**: Jalankan Certbot Let's Encrypt untuk mendapatkan sertifikat HTTPS gratis.

#### Opsi B: PaaS Cloud Terpisah (Netlify/Vercel + Railway)
Memisahkan deployment frontend dan backend menggunakan layanan pihak ketiga yang terintegrasi Git:
1.  **Frontend (Vue PWA)**: Hosting gratis di **Netlify** atau **Vercel**. Pastikan Anda mengatur *build command* `npm run build` dan *publish directory* ke `frontend/dist`.
2.  **Backend (Laravel)**: Dideploy ke **Railway.app** atau **Render.com**. Hubungkan database cloud yang disediakan (misal MySQL/PostgreSQL).
3.  **Pengaturan Redirect / CORS**: Tambahkan file `_redirects` di Netlify atau `vercel.json` di Vercel untuk mengarahkan request `/api/*` ke URL backend Railway Anda secara otomatis tanpa terkena isu CORS browser.

> [!NOTE]
> Detail petunjuk langkah-langkah perintah SSH, konfigurasi file `_redirects` Netlify, berkas `vercel.json` Vercel, serta contoh konfigurasi Nginx Server Block dapat dibaca secara lengkap pada berkas panduan deployment khusus:
> 
> **[deployment_guide.md](file:///C:/Users/M S I/.gemini/antigravity-ide/brain/b621d16e-d789-49bf-9855-8e8bc446bc1e/deployment_guide.md)**
