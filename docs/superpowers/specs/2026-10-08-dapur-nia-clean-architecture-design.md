# Desain Arsitektur & Antarmuka Dapur Nia (Clean Production-Ready)

**Tanggal:** 2026-10-08  
**Referensi Utama:** [PRD-App-2-Dapur-Nia.docx.md](file:///d:/Bootcamp%20Plan%20Internasional/ON%20BOARDING/PERTEMUAN3_021026/dapur-nia/PRD-App-2-Dapur-Nia.docx.md) & [Minutes-of-Meeting-Dapur-Nia.docx.md](file:///d:/Bootcamp%20Plan%20Internasional/ON%20BOARDING/PERTEMUAN3_021026/dapur-nia/Minutes-of-Meeting-Dapur-Nia.docx.md)  
**Status:** Disetujui Pengguna  

---

## 1. Latar Belakang & Masalah yang Diselesaikan

1. **Header Rusak & AI Slop Dihilangkan**:
   - Menghapus banner gradient Tailwind yang rusak (teks putih di atas latar putih).
   - Menghapus elemen generik berlebihan: bintang fake ⭐ 4.9, teks dummy "100% Halal", badge emoji (👑, 🧑‍🍳, 🛍️), dan efek neon/glow.
   - Menggantinya dengan antarmuka katering rumahan yang bersih, berbobot, beraksen hangat alami, dan memiliki kontras tinggi yang mudah dibaca di ponsel.
2. **Kesesuaian Hak Akses (MoM Bagian 2)**:
   - **Pemilik (Dina)**: Memiliki hak atas seluruh fitur (tambah/ubah menu & harga, buku pelanggan, membatalkan pesanan terkonfirmasi, laporan harian omset dan porsi).
   - **Staf Dapur (Rani)**: Hanya berwenang melihat daftar pesanan katering dan memproses/mengonfirmasi pembayaran. **Rani tidak berwenang menambah/mengubah menu dan tidak dapat membuka laporan harian.**
   - **Pelanggan**: Hanya melihat menu katering dan riwayat pesanan miliknya sendiri di tab **"Pesanan Saya"**. Privasi data pesanan orang lain dan buku pelanggan tertutup 100%.
   - **Tamu (Guest)**: Bisa melihat menu dan sisa porsi. Saat menekan tombol `+`, diarahkan untuk masuk/daftar akun terlebih dahulu.
3. **Kesiapan Produksi (Siap Pakai)**:
   - Menghapus seluruh switcher demo role dan teks mock. Menggunakan autentikasi akun nyata (Firebase Auth) dengan peran tersimpan di profil Firestore.

---

## 2. Alur Pemesanan (Pilihan B: Ringkas & Bersih)

### 2.1 Alur Tamu
1. Tamu membuka aplikasi & melihat daftar menu katering harian, harga, dan sisa porsi.
2. Saat tamu menekan tombol `+` pada menu apa pun:
   - Muncul dialog / ajakan ramah: *"Silakan masuk atau daftar akun terlebih dahulu untuk memesan menu katering Dapur Nia."*
   - Tamu diarahkan ke form Masuk / Daftar.

### 2.2 Alur Pelanggan Terdaftar
1. Pelanggan yang sudah masuk memilih porsi makanan di katalog menu (klik `+`, bisa multi-menu).
2. Di bagian bawah layar muncul bar ringkasan minimalis (clean, bukan AI slop):
   ```
   [ 3 Porsi • Rp 45.000 ]               [ Pesan Sekarang → ]
   ```
   - Hanya menampilkan: **jumlah porsi yang dipesan** dan **total harga**, didampingi tombol aksi **Pesan Sekarang**.
   - Desain solid minimalis (background netral gelap kontras dengan teks putih bersih, tanpa animasi norak).
3. Saat tombol **Pesan Sekarang** ditekan:
   - Membuka modal konfirmasi pesanan dengan seluruh menu yang dipilih sudah terisi otomatis.
   - Nama, nomor WhatsApp, dan alamat pelanggan terisi otomatis dari profil akun.
   - Ongkos kirim terkunci tetap Rp 10.000 (sesuai MoM Aturan Operasional 2).
   - Catatan pesanan opsional (misal: "tidak pedas").
   - Pelanggan menekan **Simpan Pesanan**.
4. Pesanan tersimpan ke Firestore dengan status awal `menunggu_bayar`, stok porsi menu otomatis berkurang, dan pesanan tampil di tab **Pesanan Saya**.

---

## 3. Penataan Navigasi & Hak Akses Berdasarkan Peran

| Peran | Tab yang Muncul di Bawah | Hak Modul Menu | Hak Modul Pesanan | Hak Modul Pelanggan | Hak Modul Laporan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tamu** | `Menu Katering` | Baca saja | Tidak ada | Tidak ada | Tidak ada |
| **Pelanggan** | `Menu Katering`, `Pesanan Saya` | Baca & Pesan | Hanya pesanannya sendiri | Data diri sendiri | Tidak ada |
| **Staf (Rani)** | `Menu Katering`, `Kelola Pesanan`, `Buku Pelanggan` | Baca saja (terkunci dari edit) | Lihat semua & konfirmasi pembayaran | Lihat kontak & alamat kirim | Tidak ada (terkunci) |
| **Pemilik (Dina)** | `Menu Katering`, `Kelola Menu`, `Buku Pelanggan`, `Kelola Pesanan`, `Laporan` | Penuh (tambah/ubah/hapus/harga) | Penuh (termasuk batalkan) | Penuh | Penuh (omset & porsi) |

---

## 4. Desain Visual (Clean Minimalist Katering)

1. **Header Bersih**:
   - Kiri: Logo Dapur Nia sederhana + nama "Dapur Nia" + teks ringkas "Katering Harian Rumahan".
   - Kanan: Tombol "Masuk" jika tamu, atau nama pengguna + tombol "Keluar" jika sudah login.
   - Latar belakang solid putih / dark card dengan garis batas (`border-b`) halus dan kontras tajam.
2. **Katalog Menu**:
   - Header teks jelas: *"Menu Katering Hari Ini"* dengan catatan jam tutup pesanan 12.00 WIB.
   - Filter pill kategori dinamis murni dari kategori nyata (Lauk, Sayur, Paket, Minuman) dengan styling rounded-full minimalis.
   - Kartu menu dengan foto masakan proporsional, harga tebal, label "Habis" jika stok 0, dan tombol `+` yang rapi.
3. **Modal Anti-Overbig**:
   - `max-h-[85vh]` flex-col dengan body `overflow-y-auto` dan footer tombol `shrink-0 sticky bottom-0`.
   - Dropdown menggunakan `AriakitSelect`.

---

## 5. Rencana Pengujian

1. **Unit Test**: Memverifikasi validasi ongkir min 10k, invariant stok, dan kalkulasi laporan harian.
2. **Build Check**: Memastikan `tsc -b && vite build` lulus tanpa error.
3. **Verifikasi Alur**: Uji alur Tamu -> Login Pelanggan -> Pilih Multi-Menu -> Bar Bawah -> Checkout -> Pesanan Saya. Uji hak akses Staf Rani (tanpa kelola menu/laporan) dan Dina (akses penuh).
