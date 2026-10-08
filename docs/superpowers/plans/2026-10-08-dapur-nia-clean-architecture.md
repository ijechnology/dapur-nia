# Dapur Nia Clean Architecture & UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengimplementasikan perombakan antarmuka katering bersih bebas "AI slop", alur pemesanan ringkas (Pilihan B dengan bar bawah yang hanya menampilkan porsi & harga), dan penegakan hak akses 100% sesuai MoM & PRD (Dina Pemilik, Rani Staf Dapur, Pelanggan, dan Tamu).

**Architecture:** Frontend React/TypeScript dengan arsitektur peran ketat (RBAC), navigasi bawah dinamis berbasis peran, modal anti-overbig dengan sticky footer, formulir dengan AriakitSelect, dan backend Cloud Firestore.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, @ariakit/react, Cloud Firestore, Firebase Auth, Vitest.

**Spec:** [docs/superpowers/specs/2026-10-08-dapur-nia-clean-architecture-design.md](file:///d:/Bootcamp%20Plan%20Internasional/ON%20BOARDING/PERTEMUAN3_021026/dapur-nia/docs/superpowers/specs/2026-10-08-dapur-nia-clean-architecture-design.md)

## Global Constraints
- Hilangkan seluruh gradient oranye rusak, badge emoji berlebih (👑, 🧑‍🍳, 🛍️), teks bintang fake ⭐ 4.9, dan teks demo.
- Desain bersih minimalis dengan kontras tinggi (dark charcoal pada latar putih di light mode).
- Staf Rani HANYA melihat pesanan katering dan memproses/konfirmasi pembayaran. Terkunci dari kelola menu & laporan.
- Pemilik Dina memiliki akses penuh (kelola menu, harga, pesanan, dan laporan keuangan).
- Pelanggan hanya melihat menu katering dan riwayat pesanan miliknya sendiri (tab "Pesanan Saya").
- Ongkir terkunci tetap Rp 10.000.
- Bar mengambang bawah HANYA menampilkan: berapa porsi yang dipesan dan total harganya + tombol Pesan Sekarang.
- Tamu (belum login) dapat melihat menu, namun saat klik `+` diarahkan untuk masuk/daftar.

## Review Focus
1. **Kontras Teks & Keterbacaan**: Header dan kartu menu harus terbaca dengan tajam tanpa ada teks putih menabrak latar putih.
2. **Kesesuaian RBAC**: Rani (Staf) tidak boleh memiliki akses untuk menambah/mengubah menu atau membuka laporan.
3. **Privasi Data Pelanggan**: Pelanggan tidak boleh dapat melihat pesanan pelanggan lain atau buku pelanggan.
4. **Alur Pilihan B**: Item yang dipilih di halaman menu harus otomatis masuk ke modal checkout tanpa perlu memilih ulang.
5. **Modal Anti-Overbig**: Tombol footer pada modal pemesanan tidak boleh terdorong keluar layar di perangkat ponsel.

---

### Task 1: Pembersihan Header Navbar & Identitas Brand
**Files:**
- Modify: `src/components/Navbar.tsx`

- [ ] Hapus badge emoji (👑, 🧑‍🍳, 🛍️) dan teks demo di Navbar.
- [ ] Buat header elegan dan berbobot: Logo Dapur Nia sederhana, teks nama toko jelas berlatar belakang bersih, nama akun pengguna (jika login), dan tombol Keluar/Masuk yang rapi dengan kontras tajam.
- [ ] Verifikasi keterbacaan teks dan status koneksi/login di ponsel.

---

### Task 2: Pembersihan Banner & Header di MenuTab
**Files:**
- Modify: `src/components/menu/MenuTab.tsx`
- Modify: `src/components/menu/MenuCard.tsx`

- [ ] Hapus banner gradient oranye rusak (`bg-linear-to-br`) yang membuat teks putih tak terbaca.
- [ ] Hapus badge bintang fake ⭐ 4.9 dan teks hardcoded.
- [ ] Buat header menu bersih: *"Menu Katering Hari Ini"* dengan deskripsi singkat mengenai batas pemesanan pukul 12.00 WIB.
- [ ] Tangani aksi klik `+` pada tamu: Jika pengguna belum login, munculkan dialog ajakan masuk/daftar (bukan menambah porsi).
- [ ] Rapikan kartu menu: foto masakan proporsional, label porsi ready/habis yang bersih, dan tombol aksi `+` / counter `[-] [qty] [+]`.

---

### Task 3: Redesain Floating Order Bar Minimalis (Pilihan B Sesuai Kesepakatan)
**Files:**
- Modify: `src/components/menu/FloatingOrderBar.tsx`

- [ ] Redesain bar bawah menjadi sangat ringkas: **Hanya menampilkan berapa porsi yang dipesan dan berapa harganya saja** (contoh: `3 Porsi • Rp 45.000`), didampingi tombol bersih `Pesan Sekarang →`.
- [ ] Terapkan warna solid netral gelap (slate-900 / zinc-900) dengan teks putih bersih berbobot tebal, tanpa ikon berlebih atau gradient norak.
- [ ] Pastikan posisi bar melayang di atas tab navigasi bawah dan tidak menutupi konten penting.

---

### Task 4: Penegakan Hak Akses MoM (Dina, Rani, Pelanggan, Tamu)
**Files:**
- Modify: `src/components/BottomNav.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/menu/KelolaMenuTab.tsx`

- [ ] Dinamisasi BottomNav berdasarkan peran:
  - Tamu: Tab `Menu Katering`.
  - Pelanggan: Tab `Menu Katering` dan `Pesanan Saya`. (Sembunyikan Buku Pelanggan, Kelola Menu, dan Laporan).
  - Staf Rani: Tab `Menu Katering`, `Kelola Pesanan`, dan `Buku Pelanggan`. (Sembunyikan Kelola Menu dan Laporan).
  - Pemilik Dina: Tab `Menu Katering`, `Kelola Menu`, `Buku Pelanggan`, `Kelola Pesanan`, dan `Laporan`.
- [ ] Di `KelolaMenuTab.tsx`: Pastikan hanya peran `pemilik` yang dapat menambah atau mengedit menu/harga. Jika staf atau pelanggan mencoba akses, tolak dengan pesan yang ramah.
- [ ] Di `App.tsx`: Kunci tab `laporan` hanya untuk `pemilik` (Dina).

---

### Task 5: Modal Pemesanan & Alur Checkout Bersih
**Files:**
- Modify: `src/components/pesanan/PesananCreateModal.tsx`
- Modify: `src/components/pesanan/PesananTab.tsx`

- [ ] Pastikan modal pesanan menerima pilihan multi-menu dari bar bawah otomatis tanpa perlu pilih ulang.
- [ ] Autofill nama, nomor WhatsApp, dan alamat pengiriman dari profil akun pelanggan yang sedang login.
- [ ] Kunci ongkir tetap Rp 10.000 (sesuai MoM).
- [ ] Terapkan struktur modal anti-overbig: `max-h-[85vh]` dengan body scrollable dan footer tombol `Simpan Pesanan` sticky di bawah layar.
- [ ] Di `PesananTab.tsx`, untuk pelanggan: HAPUS tombol "Lihat Semua Pesanan Orang Lain" agar privasi pelanggan lain terlindungi 100%. Pelanggan hanya dapat melihat pesanannya sendiri.

---

### Task 6: Pembersihan Halaman Autentikasi (Siap Pakai)
**Files:**
- Modify: `src/components/auth/AuthPage.tsx`

- [ ] Hapus seluruh tombol 1-click role demo switcher ("👑 Bu Nia", "🧑‍🍳 Rani", "🛍️ Dina") dan teks demo mock.
- [ ] Buat antarmuka login dan registrasi akun riil yang bersih (Tab Masuk dan Tab Daftar Akun Pelanggan Baru dengan nomor WhatsApp).
- [ ] Hubungkan ke Firebase Auth nyata dan sinkronisasi data profil Firestore.

---

### Task 7: Verifikasi, Testing & Build
**Files:**
- Test: `src/test/validation.test.ts`
- Test: `src/test/auth.test.ts`

- [ ] Jalankan unit test `npx vitest run` untuk memastikan seluruh aturan bisnis & validasi lulus.
- [ ] Jalankan `npm run build` untuk memverifikasi kelulusan kompilasi TypeScript dan bundle Vite (target: code 0).
- [ ] Review tampilan akhir di browser lokal.
