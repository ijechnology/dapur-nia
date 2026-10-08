# Dapur Nia Full Upgrade: UI Shopee Food, Ariakit Select, Role-Based Flow & Firestore Authentication Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengupgrade aplikasi Dapur Nia secara menyeluruh mencakup perbaikan visual UI bergaya Shopee Food, integrasi dropdown modern `@ariakit/react`, alur peran pengguna (Pemilik, Staf, Pelanggan) dengan Firebase Auth & Firestore, modal pemesanan responsif tanpa terpotong, aturan ongkir minimal Rp 10.000, serta kategori menu yang dinamis.

**Architecture:** Menerapkan sistem autentikasi & otorisasi multi-role berbasis Firebase Auth + Firestore (`users` collection) dengan alur tamu (guest) dapat melihat menu dan jika memesan diarahkan login; merancang komponen pemilih `@ariakit/react` Select terstandar; menata ulang tata letak menu berbasis kartu visual makanan beresolusi tinggi dengan floating order bar; dan memperbaiki scrolling flex-col modal agar responsif di semua ukuran layar.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, `@ariakit/react`, Firebase Auth, Cloud Firestore, Lucide Icons, Vitest.

**Spec:** PRD App 2 Dapur Nia, Skema Firestore Dapur Nia, dan Dokumen Alur Hak Akses Pemilik vs Pembeli.

## Global Constraints

- Skema koleksi utama di Firestore tetap terjaga integritasnya (`menu`, `pelanggan`, `pesanan`, ditambah `users` untuk auth role).
- Invarian aturan bisnis: Ongkir minimal Rp 10.000, harga menu > 0, sisa porsi >= 0.
- Dropdown di seluruh aplikasi wajib menggunakan styling `@ariakit/react` yang disediakan pengguna (support dark/light mode dan accessible keyboard navigation).
- Modal dialog wajib memiliki batasan tinggi (`max-h-[85vh]` / `max-h-[90dvh]`) dengan body scrollable dan footer tombol aksi yang selalu sticky di layar.
- Peran (Roles): `pemilik` (Bu Nia/Dina pemilik), `staf` (Rani staf pesanan), `pelanggan` (Pembeli umum).

## Review Focus

1. **Guest Order Redirect:** Tamu yang memesan tanpa login diarahkan ke login, dan setelah login pesanan tidak hilang (draf tersimpan).
2. **Role Authorization Guard:** Pelanggan yang mencoba membuka "Kelola Menu" atau "Laporan" otomatis diblokir dengan tampilan penolakan akses yang ramah dan jelas.
3. **Modal Scrolling Boundary:** Saat memesan 8+ item menu di layar HP (viewport < 700px), tombol "Simpan Pesanan" di footer tetap terlihat dan dapat diklik tanpa terpotong.
4. **Ongkir Validation Limit:** Upaya mengisi ongkir di bawah Rp 10.000 akan ditolak oleh validasi form dan service layer.
5. **Ariakit Select Interactivity:** Ariakit Select dapat dibuka, dipilih nilainya dengan mouse atau keyboard (Arrow Up/Down + Enter), dan nilainya tersinkronisasi ke state form React.

---

## Analisis & Penilaian Kejanggalan Aplikasi Saat Ini

Berdasarkan evaluasi terhadap 7 poin feedback yang diberikan:

1. **Ongkos Kirim (Ongkir):**
   - *Kondisi saat ini:* Form membolehkan ongkir 0 rupiah.
   - *Kejanggalan:* Berdasarkan PRD pengiriman katering, kurir/pengantaran memiliki batas biaya minimal Rp 10.000. Jika 0 rupiah, Dapur Nia menanggung beban kirim yang tidak wajar.
   - *Solusi:* Kunci nilai minimal ongkir di Rp 10.000, berikan validasi form dan info bantuan di bawah input.
2. **Responsivitas & Overflow Modal:**
   - *Kondisi saat ini:* Modal menggunakan wrapper sederhana dengan auto-height. Saat item banyak, tinggi modal melebihi tinggi viewport peramban, mendorong tombol aksi ke bawah hingga terpotong dan tidak bisa diklik.
   - *Solusi:* Pisahkan container modal menjadi 3 segmen: Header (`shrink-0`), Body (`flex-1 overflow-y-auto max-h-[60vh]`), dan Footer (`shrink-0 border-t sticky bottom-0`).
3. **Pill Kategori Menu ("Semua" & "Umum"):**
   - *Kondisi saat ini:* MenuCard dan filter pill menggunakan fallback `'Umum'` karena data awal tidak memiliki field `kategori` terstruktur.
   - *Solusi:* Sinkronkan field `kategori` di dokumen Firestore (`Lauk`, `Sayur`, `Minuman`, `Paket`, `Camilan`). Generate pill kategori secara dinamis dari kategori unik yang ada di database.
4. **Arsitektur Alur & Hak Akses (Role-Based Access Control):**
   - *Kondisi saat ini:* Aplikasi hanya menyediakan satu tampilan yang mencampur fungsi pemilik (Kelola Menu, Laporan) dengan pelanggan. Pelanggan biasa melihat tombol "Kelola Menu" yang membingungkan.
   - *Solusi:* Buat 3 profil hak akses:
     - **Tamu (Belum Login):** Bisa eksplorasi menu lezat. Klik "Pesan" memicu dialog login pembeli.
     - **Pelanggan:** Memilih menu, membuat pesanan, dan melihat **hanya pesanan miliknya sendiri** (riwayat pesanan pembeli). Tombol "Kelola Menu" dan "Laporan" disembunyikan/dikunci.
     - **Staf:** Mengelola status pesanan masuk (konfirmasi bayar, proses, selesai, batal), tidak bisa edit harga menu atau melihat laporan omset.
     - **Pemilik (Bu Nia):** Akses penuh ke seluruh fitur (Master Menu, Pelanggan, Pesanan, Laporan Penjualan).
5. **Desain UI Menu ala Shopee Food:**
   - *Kondisi saat ini:* Kartu menu polos tanpa gambar makanan, terkesan seperti aplikasi database administratif.
   - *Solusi:* Gunakan foto masakan resolusi tinggi yang menggugah selera untuk setiap menu (Ayam Bakar Madu, Mie Ayam Pangsit, Rendang Padang, dsb), badge harga mencolok, rating katering, dan tombol cepat `+ Pesan` di kartu menu, didukung *Floating Order Bar* di bagian bawah saat ada menu yang dipilih.
6. **Autentikasi Firebase & Manajemen Akun:**
   - Menyediakan pendaftaran akun pembeli (Nama, Email, Password, No WhatsApp) dan menyimpan profil ke koleksi `users` di Firestore.
   - Menyediakan tombol cepat (1-Click Switcher) untuk memudahkan pengujian login: Akun Pemilik (Bu Nia), Akun Staf (Rani), dan Akun Pelanggan (Dina/Budi).
7. **Komponen Ariakit Select:**
   - Mengintegrasikan `@ariakit/react` untuk semua elemen dropdown (pemilihan pelanggan, filter kategori, pemilihan status).

---

## Task Decomposition

### Task 1: Setup Library `@ariakit/react` & Buat Reusable `AriakitSelect` Component

**Files:**
- Create: `src/components/ui/ariakit-select.css`
- Create: `src/components/ui/AriakitSelect.tsx`
- Modify: `package.json`

**Interfaces:**
- Produces: `<AriakitSelect label={string} value={string} onChange={(val: string) => void} options={Array<{ value: string, label: string, disabled?: boolean }>} />`

- [ ] **Step 1: Install `@ariakit/react`**
  Jalankan: `npm i @ariakit/react`
- [ ] **Step 2: Buat file stylesheet `src/components/ui/ariakit-select.css`**
  Terapkan styling CSS yang diberikan user (mendukung dark mode, border, hover, shadow, dan active popover state).
- [ ] **Step 3: Implementasi komponen `src/components/ui/AriakitSelect.tsx`**
  Gunakan `Ariakit.SelectProvider`, `Ariakit.SelectLabel`, `Ariakit.Select`, `Ariakit.SelectPopover`, dan `Ariakit.SelectItem`.
- [ ] **Step 4: Uji render komponen `AriakitSelect`**
  Pastikan komponen dapat menerima prop `value`, `onChange`, dan merender popover pilihan dengan benar tanpa error lint/type.

---

### Task 2: Arsitektur Autentikasi & Role-Based Access Control (RBAC) di Firestore

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/context/AuthContext.tsx`
- Modify: `src/components/auth/LoginModal.tsx`
- Create: `src/services/userService.ts`

**Interfaces:**
- User Roles: `'pemilik' | 'staf' | 'pelanggan' | 'tamu'`
- `AuthUser`: `{ uid: string, email: string, displayName: string, role: UserRole, noWhatsapp?: string }`
- `useAuth()` exposes: `{ user, role, signIn, signUp, signOut, switchDemoRole }`

- [ ] **Step 1: Update tipe data di `src/types/index.ts`**
  Tambahkan `UserRole = 'pemilik' | 'staf' | 'pelanggan'` dan perbarui interface `AuthUser`.
- [ ] **Step 2: Buat `userService.ts` untuk sinkronisasi profil pengguna ke Firestore**
  Fungsi: `saveUserProfile(uid, data)` dan `getUserProfile(uid)` di koleksi `users`.
- [ ] **Step 3: Update `AuthContext.tsx`**
  - Baca role dari dokumen Firestore `users/{uid}` saat user login.
  - Sediakan demo accounts switcher:
    - Pemilik: `pemilik@dapurnia.com` (Bu Nia)
    - Staf: `staf@dapurnia.com` (Rani)
    - Pelanggan: `dina@gmail.com` (Dina - Pelanggan)
- [ ] **Step 4: Update modal `LoginModal.tsx`**
  - Tampilkan tab Masuk & Daftar Pelanggan Baru (dengan input No WhatsApp untuk pelanggan).
  - Tampilkan tombol Quick Demo Switcher (Bu Nia Pemilik, Rani Staf, Dina Pembeli) untuk pengujian instan sesuai gambar alur PRD.

---

### Task 3: Redesign UI Halaman Menu & Beranda Bergaya "Shopee Food"

**Files:**
- Modify: `src/components/menu/MenuCard.tsx`
- Modify: `src/components/menu/MenuTab.tsx`
- Create: `src/components/menu/FloatingOrderBar.tsx`
- Modify: `src/components/menu/KelolaMenuTab.tsx`

**Interfaces:**
- `MenuCard`: Menampilkan foto kuliner lezat, badge kategori, badge ketersediaan porsi, harga formatted, dan tombol aksi `+ Pesan`.
- `FloatingOrderBar`: Sticky bottom bar yang muncul jika pelanggan memilih menu, menampilkan ringkasan jumlah item dan tombol langsung "Lanjutkan Pesanan".

- [ ] **Step 1: Tambahkan visual gambar makanan berkualitas tinggi pada data menu**
  Sediakan gambar hidangan representatif untuk menu utama (Ayam Bakar, Mie Ayam, Nasi Goreng, Soto Ayam, Rendang, Gado-gado, Es Teh, Es Jeruk, Bandeng Presto).
- [ ] **Step 2: Redesign `MenuCard.tsx` bergaya Shopee Food**
  - Tampilan visual horizontal/kartu makanan modern: Foto makanan di sisi kiri/atas, detail judul tebal, deskripsi singkat, kategori badge berwarna, harga promo/asli, tombol aksi `+ Pesan` yang kontras.
- [ ] **Step 3: Perbaiki Pill Kategori di `MenuTab.tsx`**
  - Ekstrak kategori unik secara dinamis dari menu (`Lauk`, `Sayur`, `Minuman`, `Paket`, `Camilan`).
  - Hapus kejanggalan badge yang selalu bertuliskan "Umum".
- [ ] **Step 4: Implementasi `FloatingOrderBar.tsx`**
  - Muncul halus di bagian bawah layar saat pelanggan memilih menu tanpa perlu mencari tombol di navbar.

---

### Task 4: Perbaikan Modal Pemesanan (Responsif, Anti-Overbig, & Aturan Ongkir Min Rp 10.000)

**Files:**
- Modify: `src/components/pesanan/PesananCreateModal.tsx`
- Modify: `src/components/pesanan/PesananDetailModal.tsx`
- Modify: `src/lib/validation.ts`
- Modify: `src/services/pesananService.ts`

**Interfaces:**
- Aturan Validasi Ongkir: `ongkir >= 10000` (pesan error: *"Ongkos kirim katering minimal Rp 10.000"*).
- Layout Modal: `fixed inset-0 flex items-center justify-center` dengan child `max-h-[85vh] flex flex-col`.
- Body Modal: `flex-1 overflow-y-auto overscroll-contain`.
- Footer Modal: `shrink-0 sticky bottom-0 bg-card border-t p-4`.

- [ ] **Step 1: Terapkan aturan ongkir minimal Rp 10.000 di `validation.ts` dan form**
  Set `min="10000"`, `defaultValue="10000"`, dan validasi sebelum submit.
- [ ] **Step 2: Ganti dropdown pelanggan dengan `AriakitSelect`**
  Gunakan komponen `AriakitSelect` baru untuk memilih pelanggan dengan tampilan modern dan pencarian yang nyaman.
- [ ] **Step 3: Restrukturisasi layout `PesananCreateModal.tsx` agar anti-overbig**
  Bungkus daftar menu dan ringkasan dalam scrollable body container, sehingga tombol "Simpan Pesanan" di footer selalu terlihat dan bisa diklik.
- [ ] **Step 4: Terapkan layout anti-overbig yang sama pada `PesananDetailModal.tsx`**
  Pastikan rincian pesanan dengan banyak menu tetap nyaman di-scroll pada layar kecil.

---

### Task 5: Penyelarasan Alur Pengguna (Tamu, Pembeli, Staf, & Pemilik)

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Navbar.tsx` (atau navigasi header/bottom)
- Modify: `src/components/pesanan/PesananTab.tsx`
- Modify: `src/components/laporan/LaporanTab.tsx`

**Interfaces:**
- Alur Tamu -> Masuk -> Pesan:
  Jika tamu klik "Pesan", simpan draft pesanan, buka `LoginModal`. Setelah login sebagai pembeli, pesanan langsung diproses.
- Alur Pembeli (Dina):
  Tab "Pesanan Saya" hanya menampilkan pesanan yang dibuat oleh nomor WA / akun Dina. Akses ke "Kelola Menu" dan "Laporan" dicegah (Authorization Blocked).
- Alur Staf (Rani):
  Bisa melihat seluruh pesanan dan memproses status pesanan. Tidak bisa mengubah master menu atau melihat laporan omset keuangan.
- Alur Pemilik (Bu Nia):
  Akses penuh ke semua menu (Menu, Kelola Menu, Pelanggan, Pesanan, Laporan).

- [ ] **Step 1: Pasang Authorization Guard pada setiap Tab di `App.tsx`**
  Tampilkan banner penolakan akses / pesan ramah jika Pembeli mencoba membuka Kelola Menu atau Laporan.
- [ ] **Step 2: Filter daftar pesanan di `PesananTab.tsx` sesuai Role**
  - Jika Pelanggan: Tampilkan hanya pesanan miliknya (`pesanan.pelanggan_id === user.noWhatsapp` atau filter by user).
  - Jika Staf / Pemilik: Tampilkan seluruh pesanan masuk dengan filter status alur kerja.
- [ ] **Step 3: Integrasikan `AriakitSelect` pada filter status dan filter tanggal pesanan**
  Ganti elemen `<select>` browser native dengan `AriakitSelect`.

---

### Task 6: Verifikasi, Testing, & Validasi Akhir

**Files:**
- Test: `src/test/validation.test.ts`
- Test: `src/test/auth.test.ts`

- [ ] **Step 1: Jalankan unit testing**
  Jalankan `npm test` dan pastikan seluruh test validasi ongkir minimal 10k, multi-menu, dan role RBAC lulus 100%.
- [ ] **Step 2: Jalankan build produksi**
  Jalankan `npm run build` dan pastikan bundling Vite serta TypeScript compilation lulus tanpa error (`exit code 0`).
- [ ] **Step 3: Verifikasi tampilan di browser**
  Pastikan UI Shopee Food terlihat menggugah selera, Ariakit Select berfungsi mulus, modal tidak terpotong, dan peralihan akun Pemilik/Staf/Pelanggan bekerja tepat sasaran.
