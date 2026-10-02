# Dokumen Spesifikasi Desain: App 2 Dapur Nia

- **Tanggal**: 2026-10-02
- **Status**: Disetujui (Menunggu Review Akhir Dokumen)
- **Basis Data**: Cloud Firestore
- **Framework & Tooling**: Vite + React (TypeScript) + Tailwind CSS + Shadcn UI (Styling Preset `b1dnAsE2Km`)
- **Deployment Target**: Netlify

---

## 1. Ringkasan Eksekutif & Tujuan

Dapur Nia adalah katering harian rumahan milik Dina. Aplikasi ini mendigitalkan pencatatan pesanan manual, mengontrol sisa porsi menu secara real-time, mencegah perhitungan tagihan salah/minus, serta menyajikan laporan harian porsi dan omset penjualan.

Pada Sesi 3, aplikasi diimplementasikan dalam arsitektur **Single Role** (akses pengelola penuh untuk menu, pelanggan, pesanan, dan laporan) guna melatih integritas data dan operasi CRUD Firestore.

---

## 2. Arsitektur Teknis

### 2.1 Tech Stack
- **Frontend Core**: Vite + React (TypeScript).
- **Styling**: Tailwind CSS dengan token Shadcn UI (mengadopsi preset `b1dnAsE2Km` untuk palette, typography, radii, dan button/card styles).
- **Icons**: `lucide-react`.
- **Database & Backend**: Cloud Firestore (Web SDK v10+ modular).
- **Konfigurasi Firebase**: Mendukung input dinamis via Modal Settings UI (tersimpan di `localStorage`) serta fallback `import.meta.env`.

### 2.2 Struktur Modul & Navigasi
Aplikasi dibangun sebagai **Mobile-First Single Page Application (SPA)** dengan container responsif:
- **Top Header**: Logo Dapur Nia, status indikator koneksi Firestore (Online / Terhubung / Belum Dikonfigurasi), dan tombol pengaturan Firebase.
- **Main Viewport**: Menampilkan konten tab aktif dengan animasi transisi yang mulus.
- **Bottom Navigation Bar**: 
  1. 🍱 **Menu**: Pengelolaan katalog menu dan stok sisa porsi.
  2. 👥 **Pelanggan**: Buku kontak pelanggan dan alamat pengiriman dengan proteksi nomor WA unik.
  3. 📋 **Pesanan**: Pembuatan pesanan baru, tracking status, dan pengelolaan pesanan.
  4. 📊 **Laporan**: Ringkasan omset harian dan porsi menu terjual pada tanggal terpilih.

---

## 3. Skema Data Cloud Firestore

### 3.1 Koleksi `menus`
| Field | Tipe | Wajib | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Ya | Auto-generated ID Firestore |
| `nama` | `string` | Ya | Nama makanan/paket katering |
| `deskripsi` | `string` | Tidak | Deskripsi pelengkap menu |
| `harga` | `number` | Ya | Invarian: > 0 |
| `sisaPorsi` | `number` | Ya | Invarian: integer >= 0. Jika 0, status visual berubah menjadi Habis |
| `kategori` | `string` | Ya | Contoh: Lauk, Sayur, Paket Nasi, Minuman |
| `tersedia` | `boolean` | Ya | Otomatis false jika `sisaPorsi === 0` |
| `createdAt` | `Timestamp`| Ya | Waktu pembuatan |
| `updatedAt` | `Timestamp`| Ya | Waktu pembaruan terakhir |

### 3.2 Koleksi `pelanggan`
| Field | Tipe | Wajib | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Ya | Auto-generated ID Firestore |
| `nama` | `string` | Ya | Nama lengkap pelanggan |
| `nomorWhatsapp` | `string` | Ya | Format angka bersih/dinormalisasi. Invarian: unik |
| `alamat` | `string` | Ya | Alamat tujuan pengiriman katering |
| `catatan` | `string` | Tidak | Catatan patokan rumah/preferensi |
| `createdAt` | `Timestamp`| Ya | Waktu registrasi pelanggan |

### 3.3 Koleksi `pesanan`
| Field | Tipe | Wajib | Keterangan |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Ya | Auto-generated ID Firestore |
| `nomorPesanan` | `string` | Ya | Format unik (contoh: `DN-20261002-001`) |
| `pelangganId` | `string` | Ya | Relasi ke dokumen pelanggan |
| `pelangganSnapshot` | `object` | Ya | `{ nama, nomorWhatsapp, alamat }` saat order dibuat |
| `items` | `array` | Ya | Array of item: `{ menuId, namaMenu, hargaSaatPesan, jumlahPorsi, subtotal }` |
| `ongkosKirim` | `number` | Ya | Invarian: >= 0 |
| `totalTagihan` | `number` | Ya | Invarian: sum(subtotal) + ongkosKirim (> 0) |
| `tanggalPesanan` | `string` | Ya | Format `YYYY-MM-DD` untuk query laporan |
| `waktuPesan` | `Timestamp`| Ya | Timestamp waktu pembuatan pesanan |
| `status` | `string` | Ya | Enum status yang terkontrol |
| `buktiBayarUrl` | `string` | Tidak | Opsional bukti transfer |
| `catatanPesanan` | `string` | Tidak | Instruksi pengiriman tambahan |

---

## 4. Logika Bisnis & Invarian

### 4.1 Invarian Validasi
1. **Harga & Porsi Menu**:
   - `harga > 0`. Nilai $\le 0$ ditolak.
   - `sisaPorsi >= 0`. Tidak boleh memasukkan stok minus.
2. **Pelanggan**:
   - `nomorWhatsapp` harus unik. Pengecekan dilakukan sebelum `addDoc` ke Firestore.
3. **Pesanan**:
   - `jumlahPorsi` tiap item harus $> 0$.
   - Tidak boleh memesan melebihi `sisaPorsi` menu yang tersedia.
   - Mengurangi `sisaPorsi` pada dokumen `menus` saat pesanan berhasil disimpan.
   - `totalTagihan` dihitung dari harga statis saat pemesanan ditambah ongkir. Total dijamin selalu $> 0$.

### 4.2 Mesin Status Pesanan (State Machine)
Transisi status menerapkan aturan ketat: tidak boleh melompat dan tidak boleh mundur.

- **Status Tersedia**:
  - `menunggu_pembayaran`
  - `dikonfirmasi`
  - `diproses`
  - `dikirim`
  - `selesai`
  - `dibatalkan`

- **Diagram Alur Transisi**:
  ```
  [menunggu_pembayaran]
         ├──> [dikonfirmasi] ──> [diproses] ──> [dikirim] ──> [selesai] (Terminal)
         └──> [dibatalkan] (Terminal - stok porsi dikembalikan ke menu)
  ```
- **Aksi UI**: Tombol tindakan pada kartu/detail pesanan hanya memunculkan transisi yang valid untuk status saat itu.

### 4.3 Logika Laporan Harian
- Filter berdasarkan `tanggalPesanan` (`YYYY-MM-DD`).
- **Eksklusi**: Pesanan dengan status `dibatalkan` dikeluarkan dari kalkulasi.
- **Kalkulasi**:
  - Omset total = $\sum \text{totalTagihan}$ pesanan aktif/sukses.
  - Porsi terjual = agregasi $\sum \text{jumlahPorsi}$ dikelompokkan per `menuId`.
  - Transaksi sukses = jumlah pesanan berstatus selain `dibatalkan`.
- **Empty State**: Menampilkan pemberitahuan informatif jika belum ada pesanan pada tanggal yang dipilih.

---

## 5. Rencana Pengujian (Acceptance Criteria & Test Matrix)

1. **Uji Menu**:
   - Input harga $\le 0$ $\rightarrow$ Gagal/pesan galat.
   - Porsi diisi 0 $\rightarrow$ Berhasil disimpan, badge berubah menjadi *Habis*.
2. **Uji Pelanggan**:
   - Input nomor WA duplikat $\rightarrow$ Ditolak dengan notifikasi nomor sudah terdaftar.
   - Nama/alamat kosong $\rightarrow$ Tombol simpan dinonaktifkan/validasi form muncul.
3. **Uji Pesanan**:
   - Pesan 0 porsi $\rightarrow$ Ditolak.
   - Pesan melebihi stok sisa $\rightarrow$ Ditolak.
   - Total tagihan terhitung otomatis $\rightarrow$ Tidak ada nilai minus.
   - Tombol status $\rightarrow$ Mengikuti alur resmi tanpa tombol lompat/mundur.
4. **Uji Laporan**:
   - Memilih tanggal $\rightarrow$ Akumulasi porsi & uang masuk akurat.
   - Membatalkan satu pesanan $\rightarrow$ Nominal dan porsi pada laporan tanggal terkait berkurang secara real-time.
