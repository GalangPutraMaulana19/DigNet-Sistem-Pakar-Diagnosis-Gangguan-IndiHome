# DigNet — Sistem Pakar Diagnosis Gangguan IndiHome

![Next.js](https://img.shields.io/badge/Next.js-15.4-000000?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss)

**DigNet** adalah aplikasi web sistem pakar untuk membantu teknisi provisioning mendiagnosis gangguan layanan **IndiHome (FTTH, ONT, ODP, STB UseeTV, dan Telepon)** secara cepat, konsisten, dan terukur selama masa retensi 60 hari.

Versi ini merupakan hasil pembangunan ulang (*rebuild*) dari versi PHP/MySQL sebelumnya ke arsitektur modern berbasis **Next.js App Router + TypeScript**, dengan mesin inferensi **Forward Chaining** dan **Certainty Factor (CF)** yang teruji melalui unit test.

---

## Latar Belakang

Layanan triple play IndiHome memadukan akses internet berbasis *Fiber to the Home* (FTTH), layanan TV interaktif melalui *Set-Top Box* (STB), dan telepon rumah. Di lapangan (termasuk wilayah Witel Bekasi bersama mitra pelaksana Telkom Akses), proses diagnosis gangguan masih kerap bergantung pada pengalaman individu teknisi sehingga berpotensi memperpanjang *Mean Time to Repair* (MTTR) dan meningkatkan kunjungan ulang (*revisit*) selama masa retensi 60 hari.

DigNet hadir untuk menstandarkan alur diagnosis mulai dari observasi gejala, perhitungan derajat keyakinan, hingga panduan langkah penanganan lapangan (SOP).

---

## Fitur Utama

### 1. Modul Teknisi (Publik)
- **Beranda**: Ringkasan jumlah gejala, gangguan, aturan basis pengetahuan, riwayat diagnosis terbaru, serta alur kerja inferensi sistem pakar.
- **Diagnosa Gangguan**:
  - Checklist 14 gejala gangguan IndiHome dengan filter kategori (`Internet & ONT`, `UseeTV & STB`, `Telepon & Perangkat`) dan pencarian cepat.
  - Pilihan 9 tingkat kepastian pengguna (`Pasti ya` hingga `Pasti tidak`) dan validasi minimal 1 gejala sebelum diproses.
  - Hasil diagnosis utama lengkap dengan persentase keyakinan CF, langkah penanganan lapangan (SOP), daftar kemungkinan gangguan alternatif, serta **Transparansi Perhitungan Forward Chaining & CF** per aturan.
  - Catatan lapangan opsional (nomor tiket, kode ODP, hasil ukur OPM) dan tombol **Cetak Laporan** (`@media print`).
- **Riwayat Diagnosa**: Arsip seluruh hasil diagnosis yang tersimpan otomatis di browser (`localStorage`), dilengkapi pencarian, hapus riwayat, dan halaman detail laporan siap cetak.
- **Keterangan & SOP**: Pustaka panduan teknis IndiHome FTTH (membaca lampu indikator ONT, kode error UseeTV 1302/1305/1901, standar redaman ODP, prosedur Create Ulang ONT & Voice, penanganan internet lambat, dan pencegahan revisit 60 hari).
- **Bantuan & Tentang**: Panduan penggunaan teknisi, tabel skala bobot & rumus CF, panduan admin pakar, serta informasi penelitian.

### 2. Panel Admin Pakar
- **Dashboard Admin**: Ringkasan statistik seluruh entitas, visualisasi cakupan aturan per gangguan, dan tombol **Pulihkan Data Awal** untuk mengembalikan basis pengetahuan ke dataset bawaan.
- **Manajemen Data Gejala**: Tambah, edit, cari, dan hapus daftar gejala.
- **Manajemen Data Gangguan & SOP**: Tambah, edit, dan hapus jenis tindakan perbaikan beserta uraian teknis dan langkah SOP lapangan.
- **Manajemen Basis Pengetahuan**: Kelola relasi aturan `IF (Gejala) THEN (Gangguan)` dengan nilai `MB` (*Measure of Belief*) dan `MD` (*Measure of Disbelief*) serta pratinjau langsung nilai `CF Pakar = MB - MD`.
- **Manajemen Post Keterangan**: Publikasi, sunting, dan hapus artikel panduan teknis.
- **Kelola Admin & Ubah Password**: Tambah/hapus akun administrator pakar serta pembaruan password akun aktif.

---

## Metodologi Inferensi

DigNet menerapkan **Forward Chaining** untuk menelusuri seluruh aturan yang cocok dengan gejala terpilih, kemudian menghitung bobot keyakinan menggunakan metode **Certainty Factor (MYCIN)**:

1. **Nilai CF per Aturan**:
   ```text
   CF_pakar = MB - MD
   CF(H, E) = CF_pakar × CF_user
   ```

2. **Kombinasi CF untuk Beberapa Gejala pada Gangguan yang Sama**:
   - **Kedua CF positif (`CF_1 ≥ 0` dan `CF_2 ≥ 0`)**:
     ```text
     CF_combine = CF_1 + CF_2 × (1 - CF_1)
     ```
   - **Tanda berlawanan (`CF_1 × CF_2 < 0`)**:
     ```text
     CF_combine = (CF_1 + CF_2) / (1 - min(|CF_1|, |CF_2|))
     ```
   - **Kedua CF negatif (`CF_1 < 0` dan `CF_2 < 0`)**:
     ```text
     CF_combine = CF_1 + CF_2 × (1 + CF_1)
     ```

### Tabel Bobot Kepastian Pengguna (`CF_user`)

| ID | Kondisi | Bobot |
| :-: | :--- | --: |
| 1 | Pasti ya | `+1.0` |
| 2 | Hampir pasti ya | `+0.8` |
| 3 | Kemungkinan besar ya | `+0.6` |
| 4 | Mungkin ya | `+0.4` |
| 5 | Tidak tahu | `-0.2` |
| 6 | Mungkin tidak | `-0.4` |
| 7 | Kemungkinan besar tidak | `-0.6` |
| 8 | Hampir pasti tidak | `-0.8` |
| 9 | Pasti tidak | `-1.0` |

### Contoh Perhitungan (Skenario Uji)
- Gejala dipilih: `G001` (*Telepon tidak dapat digunakan* = Pasti ya, `1.0`) dan `G002` (*Internet tidak terhubung* = Pasti ya, `1.0`).
- Aturan aktif untuk **Create Ulang ONT**:
  - `R106`: `MB = 0.7`, `MD = 0.1` → `CF_1 = (0.7 - 0.1) × 1.0 = 0.6000`
  - `R108`: `MB = 0.8`, `MD = 0.2` → `CF_2 = (0.8 - 0.2) × 1.0 = 0.6000`
- Kombinasi: `0.6000 + 0.6000 × (1 - 0.6000) = 0.8400` (**84.00%**).

---

## Struktur Proyek

```text
.
├── app/
│   ├── globals.css                # Konfigurasi Tailwind CSS v4 & gaya cetak (@media print)
│   ├── layout.tsx                 # Root layout, metadata SEO, dan Google Fonts
│   └── page.tsx                   # Entry point aplikasi DigNet
├── components/
│   ├── AppShell.tsx               # Navigasi sidebar desktop, drawer mobile, dan top bar
│   ├── DigNetApp.tsx              # Router tampilan publik & panel admin
│   ├── media-assets.ts            # Pemetaan aset foto lokal (ONT, ODP, STB, Teknisi)
│   └── views/
│       ├── HomeView.tsx           # Beranda & ringkasan basis pengetahuan
│       ├── DiagnosaView.tsx       # Form diagnosis, hasil CF, SOP, & trace perhitungan
│       ├── RiwayatView.tsx        # Daftar riwayat & laporan detail siap cetak
│       ├── KeteranganView.tsx     # Pustaka panduan teknis & modal detail/SOP
│       ├── BantuanView.tsx        # Panduan teknisi, rumus CF, & panduan admin
│       ├── TentangView.tsx        # Latar belakang, permasalahan, solusi, & atribusi
│       ├── AdminLoginView.tsx     # Halaman login Admin Pakar
│       ├── AdminDashboardView.tsx # Dashboard statistik & cakupan aturan
│       └── AdminCrudView.tsx      # CRUD Gejala, Gangguan, Aturan CF, Artikel, Admin & Password
├── lib/
│   ├── types.ts                   # Definisi tipe TypeScript domain DigNet
│   ├── seed-data.ts               # Dataset bawaan (14 gejala, 17 gangguan, 30 aturan, 5 riwayat, 6 artikel)
│   ├── cf-engine.ts               # Mesin inferensi Forward Chaining & Certainty Factor murni
│   ├── cf-engine.test.ts          # Unit test mesin inferensi (node:test)
│   └── store.tsx                  # State management & persistensi localStorage (SSR-safe)
└── src/assets/images/             # Aset gambar teknis FTTH IndiHome
```

---

## Instalasi & Menjalankan Secara Lokal

### Prasyarat
- **Node.js** versi `20.x` atau lebih baru
- **npm** versi `10.x` atau lebih baru

### Langkah Instalasi

```bash
# 1. Clone repositori
git clone https://github.com/GalangPutraMaulana19/DigNet-BUG.git
cd DigNet-BUG

# 2. Instal seluruh dependensi
npm install

# 3. Jalankan server pengembangan
npm run dev
```

Buka browser dan akses `http://localhost:3000`.

### Perintah yang Tersedia

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan Next.js di port `3000` |
| `npm run build` | Membangun bundle produksi (`next build`) |
| `npm run start` | Menjalankan server produksi setelah build |
| `npm run lint` | Memeriksa kualitas kode menggunakan ESLint |
| `npx tsx --test lib/cf-engine.test.ts` | Menjalankan unit test mesin inferensi Forward Chaining & CF |

---

## Kredensial Admin Bawaan

Untuk mengakses **Panel Admin Pakar** melalui menu **Login Admin Pakar**, gunakan akun bawaan yang selaras dengan basis data awal:

| Username | Password | Peran |
| :--- | :--- | :--- |
| `admin` | `admin` | Admin Pakar Utama |
| `123` | `123` | Admin Pakar |

> **Catatan Penyimpanan Data**: Secara default, seluruh perubahan CRUD (Gejala, Gangguan, Basis Pengetahuan, Post Keterangan, Admin) dan Riwayat Diagnosa disimpan di `localStorage` browser agar aplikasi dapat langsung berjalan tanpa konfigurasi database eksternal. Anda dapat mengembalikan seluruh data ke kondisi awal kapan saja melalui tombol **Pulihkan Data Awal** di **Dashboard Admin**.

---

## Deployment

Aplikasi ini telah dikonfigurasi dengan `output: 'standalone'` pada `next.config.ts`, sehingga siap di-deploy ke:
- **Vercel** (direkomendasikan — cukup hubungkan repositori GitHub dan klik *Deploy*), atau
- **Server VPS / Docker / Cloud Run** menggunakan perintah `npm run build` lalu `npm run start`.

---

## Atribusi & Kredit

- **Peneliti & Pengembang**: Galang Putra Maulana — Program Studi Teknik Informatika, **Universitas Bhayangkara Jakarta Raya**
- **Pakar Domain**: PT Mutiara Sentosa (Mitra Pelaksana Telkom Akses · Witel Bekasi)

## Lisensi

Proyek ini dikembangkan untuk keperluan akademik (Tugas Akhir / Skripsi) dan alat bantu teknis diagnosis gangguan IndiHome. Silakan cantumkan atribusi apabila menggunakan atau memodifikasi kode ini.
