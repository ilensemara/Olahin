# PANDUAN LENGKAP: Pembuatan & Arsitektur Aplikasi Olahin

Dokumen ini berisi panduan teknis, spesifikasi arsitektur, dan instruksi lengkap pembuatan aplikasi **Olahin**—Manajemen Resep Pintar dan Pelacak Gizi berbasis kulkas pengguna yang dirancang dengan antarmuka responsif Mobile-First (mockup smartphone) bernuansa alam (Zaitun/Olive Green).

---

## 📋 Daftar Isi
1. [Gambaran Umum Proyek](#1-gambaran-umum-proyek)
2. [Arsitektur Sistem Baru](#2-arsitektur-sistem-baru)
3. [Tech Stack & Dependensi](#3-tech-stack--dependensi)
4. [Struktur Folder Proyek](#4-struktur-folder-proyek)
5. [Skema Database & Relasi Model](#5-skema-database--relasi-model)
6. [Implementasi Backend (Laravel REST API)](#6-implementasi-backend-laravel-rest-api)
7. [Implementasi Frontend (Vue.js 3 SPA PWA)](#7-implementasi-frontend-vuejs-3-spa-pwa)
8. [Panduan Menjalankan & Pengujian](#8-panduan-menjalankan--pengujian)

---

## 1. Gambaran Umum Proyek

**Olahin** adalah platform digital untuk mengurangi limbah makanan (*food waste*) di tingkat rumah tangga dengan membantu pengguna melacak ketersediaan bahan pangan di kulkas mereka dan mencocokkannya dengan resep yang optimal.

### 🎯 Fitur Unggulan
- **Pencatat Bahan Kulkas:** CRUD bahan kulkas lengkap dengan pengelompokan kategori dan lencana kesegaran (indikator hari menuju kadaluarsa).
- **Input Suara AI & Pindai Kamera:** Penambahan bahan makanan cerdas menggunakan mikrofon (Web Speech API) dan streaming kamera asli (WebRTC) dengan laser pemindai neon.
- **Rekomendasi Resep Cerdas:** Algoritma pencocokan bahan kulkas (kesesuaian minimal 50%) diurutkan dari persentase kecocokan tertinggi.
- **Wizard Memasak Interaktif:** Panduan memasak per langkah dalam panel hijau zaitun, countdown timer, dan modal video tutorial YouTube terintegrasi.
- **Pelacak Kalori & Gizi Melingkar:** Visualisasi gauge lingkaran sisa kalori kulkas, diagram makronutrisi harian, dan grafik tren mingguan kalori (3 diagram batang bertumpuk per hari untuk Karbohidrat, Protein, dan Lemak).

---

## 2. Arsitektur Sistem Baru

Aplikasi ini menggunakan model arsitektur **Client-Server terpisah (Decoupled SPA)** dengan fitur **Progressive Web App (PWA)** sehingga dapat diunduh langsung di Android/iOS dan berjalan secara mandiri:

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
│  Laravel PHP Framework v10/v11 (Port: 8000)                     │
│  - Restful endpoints (Autentikasi Sanctum, CRUD Bahan, Resep)   │
│  - Algoritma Matching Resep & Pencatatan Kalori Harian          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                               │
│  SQLite Database                                                │
│  Tabel: users, ingredients, recipes, recipe_steps, daily_logs   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack & Dependensi

### 🖥️ API Backend (Laravel PHP)
- **Laravel Sanctum:** Autentikasi token untuk akses API aman.
- **SQLite:** Sistem database relasional ringan yang terintegrasi secara lokal.
- **Eloquent ORM:** Pemetaan database berorientasi objek yang efisien.

### 📱 Client Frontend (Vue.js 3 SPA PWA)
- **Vite:** Server pengembangan dan bundling yang sangat cepat.
- **Tailwind CSS v4:** Kerangka kerja CSS modern menggunakan konfigurasi `@theme` di dalam berkas CSS.
- **Vue Router:** Router Single Page Application (SPA) dengan *private route guards*.
- **Pinia:** Manajemen *state* terpusat dengan *offline fallback* lokal (menyimpan data ke `localStorage`).
- **Axios:** Klien HTTP untuk berkomunikasi dengan API Laravel.
- **vite-plugin-pwa:** Penyedia Service Worker otomatis untuk memfasilitasi performa offline.

---

## 4. Struktur Folder Proyek

```
Olahin/
├── backend/                  # Laravel REST API
│   ├── app/
│   │   ├── Models/           # User, Ingredient, Recipe, RecipeStep, DailyLog
│   │   └── Http/Controllers/ # AuthController, InventoryController, RecipeController, InsightController
│   ├── database/
│   │   ├── migrations/       # Skema tabel database
│   │   └── seeders/          # DatabaseSeeder (Budi Santoso & data contoh)
│   └── .env                  # Konfigurasi database & app backend
│
├── frontend/                 # Vue.js 3 Client (PWA)
│   ├── public/               # manifest.webmanifest & favicon.svg
│   ├── src/
│   │   ├── assets/           # Ikon & logo statis
│   │   ├── components/       # Komponen global reusable
│   │   ├── router/           # Routing halaman SPA (index.js)
│   │   ├── store/            # State Management Pinia & Axios (index.js)
│   │   ├── views/            # 12 Halaman Tampilan Utama (Splash, Fridge, Insights, dll.)
│   │   ├── App.vue           # Frame telepon mobile & bottom navigation bar
│   │   ├── main.js           # Entrypoint inisialisasi Vue & Pinia
│   │   └── style.css         # Impor Tailwind v4 & Variabel Warna Kustom
│   ├── vite.config.js        # Konfigurasi Vite & Workbox Service Worker Caching
│   ├── postcss.config.cjs    # Konfigurasi plugin CSS autoprefixer & Tailwind
│   └── tailwind.config.cjs   # Catatan referensi layout Tailwind
│
└── run_servers.bat           # File skrip runner server backend & frontend sekaligus
```

---

## 5. Skema Database & Relasi Model

Aplikasi ini menggunakan database relasional SQLite yang memisahkan instruksi memasak dan log konsumsi kalori secara terstruktur:

### 1. Model `User` (Tabel `users`)
Menampung kredensial login serta metrik fisik untuk perhitungan gizi:
- `id` (Primary Key)
- `name` (string)
- `email` (string, unique)
- `password` (string)
- `weight` (integer) - Berat badan (kg)
- `height` (integer) - Tinggi badan (cm)
- `age` (integer) - Usia (tahun)
- `target_calories` (integer, default: 2000)

### 2. Model `Ingredient` (Tabel `ingredients`)
Menyimpan persediaan bahan di kulkas pengguna:
- `id` (Primary Key)
- `user_id` (Foreign Key -> `users`)
- `name` (string)
- `quantity` (float)
- `unit` (string: pcs, gr, ml, siung)
- `category` (string: Protein, Sayuran, Bumbu, Lainnya)
- `expiry_date` (date)

### 3. Model `Recipe` (Tabel `recipes`)
Menampung data resep kuliner:
- `id` (Primary Key)
- `title` (string)
- `description` (text)
- `prep_time` (integer) - Waktu persiapan (menit)
- `calories` (integer) - Kandungan kalori (kkal)
- `youtube_video_url` (string, optional)
- `youtube_id` (string, optional)
*   **Relasi:** `hasMany` ke `RecipeStep`.

### 5. Model `RecipeStep` (Tabel `recipe_steps`)
Menyimpan instruksi langkah-demi-langkah resep secara terpisah:
- `id` (Primary Key)
- `recipe_id` (Foreign Key -> `recipes`)
- `step_number` (integer)
- `instruction` (text)

### 6. Model `DailyLog` (Tabel `daily_logs`)
Mencatat riwayat asupan kalori & gizi harian yang dikonsumsi pengguna:
- `id` (Primary Key)
- `user_id` (Foreign Key -> `users`)
- `date` (date)
- `calories` (integer)
- `carbs` (integer)
- `protein` (integer)
- `fat` (integer)

---

## 6. Implementasi Backend (Laravel REST API)

API Backend menangani autentikasi, penyediaan data gizi, pencocokan resep, dan manipulasi inventori kulkas.

### Endpoint API Utama:
1. **Autentikasi:**
   - `POST /api/register`: Menerima nama, email, sandi, serta menyimpan profil fisik standar.
   - `POST /api/login`: Memverifikasi kredensial dan menerbitkan token Sanctum.
   - `POST /api/user/update`: Memperbarui berat badan, tinggi badan, usia, dan target kalori pengguna.
2. **Kulkas (CRUD):**
   - `GET /api/inventory`: Mengambil daftar bahan kulkas pengguna.
   - `POST /api/inventory`: Menambahkan bahan kulkas baru.
   - `DELETE /api/inventory/{id}`: Menghapus bahan kulkas.
3. **Resep & Cooking:**
   - `GET /api/recipes/matched`: Menghitung persentase kesesuaian resep berdasarkan stok kulkas yang dimiliki pengguna saat ini. Resep dengan kecocokan $\ge 50\%$ akan dikembalikan.
   - `POST /api/recipes/{id}/cook`: Mencatat masakan selesai, memotong stok bahan makanan secara otomatis di database, dan mencatat perolehan gizi ke `daily_logs`.
4. **Insights:**
   - `GET /api/insights`: Mengambil data asupan hari ini, ringkasan fisik, serta data riwayat kalori 7 hari terakhir untuk grafik mingguan.

---

## 7. Implementasi Frontend (Vue.js 3 SPA PWA)

Klien Frontend dirancang agar terlihat seperti aplikasi iOS/Android asli menggunakan viewport telepon melengkung.

### 🎨 Desain Sistem & Gaya (style.css)
Menggunakan **Tailwind CSS v4** dengan variabel warna kustom:
```css
@import "tailwindcss";

@theme {
  --color-nature-cream: #F4F3EA;   /* Background aplikasi */
  --color-nature-card: #FFFFFF;    /* Background kartu */
  --color-nature-input: #EAE8DC;   /* Background form input */
  --color-nature-forest: #2C3529;  /* Teks utama */
  --color-nature-zaitun: #4D5C48;  /* Warna utama (Olive/Zaitun) */
  --color-nature-olive: #6E8067;   /* Warna zaitun sedang */
  --color-nature-sage: #D1D8CD;    /* Border & badge */
  --color-nature-mint: #EBF0E9;    /* Latar belakang badge */
  --color-nature-red: #C85C5C;     /* Peringatan kadaluarsa */
  --color-nature-yellow: #DF9D4F;  /* Warna gizi makro */
}
```

### 📱 Alur Layar Aplikasi (12 Views)
1. **Splash.vue:** Tampilan pembuka animasi bounce logo yang berdurasi 2,5 detik kemudian berpindah otomatis ke Welcome.
2. **Welcome.vue:** Menyediakan tombol masuk bernuansa zaitun, pendaftaran outline, serta tautan **"Lewati..."** untuk memintas autentikasi dan langsung masuk ke mode offline.
3. **Login.vue & Register.vue:** Kartu login glassmorphic minimalis di atas latar belakang makanan yang blur, lengkap dengan kolom garis bawah tipis dan integrasi tombol masuk media sosial Apple & Google.
4. **Home.vue:** Dashboard utama yang menyapa pengguna (misal: "Halo, Budi Santoso!"), kotak pencarian *"What do you cook today?"*, banner peringatan kadaluarsa, tombol pintas melingkar, dan grid resep 2 kolom. Dilengkapi lonceng notifikasi `🔔` yang menampilkan modal peringatan kadaluarsa serta penghematan limbah makanan saat diklik.
5. **Fridge.vue:** Mengintegrasikan dua tab fungsional:
   - **Tab Bahan Makanan:** Daftar stok kulkas per kategori dengan tag status kadaluwarsa warna teratur (hijau/kuning/merah) dan tombol plus melayang (`+`) untuk menambah bahan.
   - **Tab Analisis Gizi:** Gauge lingkaran persentase kalori kulkas, perolehan gizi makronutrisi per bahan dengan horizontal progress bar berwarna-warni, serta tombol menuju halaman resep cocok.
6. **AddIngredient.vue:** Antarmuka penambahan bahan yang dilengkapi grid prasetel bahan makanan cepat pakai emoji, penyesuai jumlah counter `+/-`, daftar draf peninjau bahan sebelum disimpan, perekam suara (Web Speech API) untuk pengenalan kata kunci, dan streaming kamera asli (WebRTC) dengan laser neon pemindai.
7. **RecipeRecommendations.vue:** Daftar resep diurutkan berdasarkan tingkat kecocokan kulkas, lengkap dengan peringatan merah jika resep tersebut memanfaatkan bahan yang hampir kadaluarsa.
8. **CookingGuide.vue:** Panduan memasak per langkah dalam kartu hijau zaitun besar, timer countdown font ekstra besar yang bisa diputar/dijeda, tombol video popup YouTube, dan tombol navigasi bawah kapsul.
9. **CookingSuccess.vue:** Selamat atas keberhasilan memasak, checklist bahan terpakai, tombol aksi merah **"Hapus Bahan"** untuk pemotongan stok database real-time, serta grafik laporan dampak pencegahan limbah pangan dan emisi CO2.
10. **Insights.vue:** Menampilkan profil yang terbagi dalam tiga tab:
    - **Tab Status Harian:** Kartu asupan kalori hari ini (misal: 1240 / 1800 kcal) dengan progress bar gizi makro, dan log makanan pagi/siang/malam.
    - **Tab Data Tubuh:** Form interaktif pembaruan berat badan, tinggi badan, usia, dan target kalori harian.
    - **Tab Riwayat 7 Hari:** Grafik tren 7 hari berupa kelompok 3 batang vertikal per hari (Karbohidrat, Protein, Lemak) yang dirancang menggunakan elemen flexbox CSS murni.

---

## 8. Panduan Menjalankan & Pengujian

### 1. Menjalankan Server Otomatis
Anda tidak perlu menyalakan backend dan frontend secara terpisah. Cukup jalankan berkas batch skrip runner di folder root:
- Klik ganda berkas **`run_servers.bat`** pada Windows Explorer.
- Skrip ini akan secara otomatis:
  1. Menjalankan server database & Laravel API Backend (`php artisan serve`) di port `8000`.
  2. Menjalankan server pengembangan Vite Frontend (`npm run dev`) di port `5173`.
  3. Membuka browser Anda secara otomatis ke halaman aplikasi.

### 2. Mengakses Aplikasi
Buka browser favorit Anda dan arahkan ke alamat berikut:
👉 **[http://localhost:5173](http://localhost:5173)**

### 3. Skenario Pengujian Alur Utama
1. **Autentikasi:** Masuk menggunakan email bawaan: `user@olahin.com` dan kata sandi: `password`. Untuk keluar, buka tab Profil -> klik tombol **Keluar 🚪** merah di kanan atas.
2. **Tambah Bahan Kulkas:** Buka halaman Kulkas -> klik tombol tambah `+`. Coba klik **Kamera `📷`** untuk streaming kamera video Anda atau klik **Mikrofon `🎤`** dan ucapkan kata *"wortel"* untuk mengisi formulir input. Tambahkan ke daftar dan klik "Simpan Bahan".
3. **Memasak & Pemotongan Stok:** Buka tab Resep, pilih resep dengan kecocokan tinggi (misal: *Nasi Goreng Telur*). Ikuti petunjuknya di panduan memasak, buka modal video YouTube, selesaikan langkah, lalu klik tombol **"Hapus Bahan"** di halaman sukses. Periksa kembali tab Kulkas Anda, stok bahan yang digunakan otomatis terpotong secara real-time dari database.
4. **Analisis Gizi:** Buka tab **Profil** -> **Riwayat 7 Hari** untuk melihat asupan kalori yang tercatat dari resep yang baru saja Anda masak.
