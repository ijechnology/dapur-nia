**Catatan Rapat Aplikasi Pemesanan Katering Dapur Nia**

Kick-off dan penggalian kebutuhan

| Aspek | Isi |
| :---- | :---- |
| Proyek | Aplikasi Pemesanan Katering Dapur Nia |
| Agenda | Kick-off dan penggalian kebutuhan |
| Durasi | 30 menit |
| Hadir | Dina selaku pemilik, Rani selaku staf dapur, tim pengembang |
| Sumber | Rekaman rapat, berkas Transkrip-Meeting-Dapur-Nia |

 

**1\. Masalah yang Disampaikan Klien**

| No | Masalah | Bukti dari klien |
| :---- | :---- | :---- |
| 1 | Pesanan tercatat manual dan sering terlewat | Pesanan dua puluh porsi tercatat dua belas, ketahuan pada hari pengiriman |
| 2 | Sisa porsi tidak diketahui saat pesanan berjalan | Kapasitas enam puluh porsi, terjual tujuh puluh, baru ketahuan saat rekap malam |
| 3 | Total tagihan dapat bernilai minus | Diskon Rp25.000 diberikan pada pesanan Rp20.000 |
| 4 | Pesanan berisi nol porsi tetap tersimpan | Formulir daring menerima nilai nol dan tetap terkirim |

   
Klien menyatakan keempat masalah tersebut membuat laporan penjualan tidak dapat dipakai untuk menghitung keuntungan.

**2\. Peran Pengguna**

| Peran | Nama | Kewenangan |
| :---- | :---- | :---- |
| Pemilik | Dina | Seluruh fitur, termasuk mengubah harga menu, membatalkan pesanan yang sudah dikonfirmasi, dan membuka laporan harian |
| Staf | Rani | Melihat daftar pesanan dan mengonfirmasi pembayaran |
| Pelanggan | Umum | Memesan tanpa membuat akun |

   
Rani tidak berwenang mengubah harga menu dan tidak dapat membuka laporan harian. Pembatalan pesanan yang sudah dikonfirmasi hanya dapat dilakukan Dina.

**3\. Alur Pemesanan yang Disepakati**

1\.	Pelanggan membuka daftar menu harian beserta sisa porsi.

2\.	Pelanggan memilih menu dan jumlah porsi.

3\.	Pelanggan mengisi nama, nomor WhatsApp, dan alamat pengiriman.

4\.	Sistem menampilkan total berupa harga menu ditambah ongkos kirim.

5\.	Pelanggan melakukan transfer, lalu mengunggah bukti bayar.

6\.	Dina atau Rani memeriksa bukti bayar, lalu mengonfirmasi atau menolak.

7\.	Pesanan yang dikonfirmasi diproses dapur, dikirim, lalu ditandai selesai.

**4\. Aturan Operasional**

| No | Aturan | Keterangan |
| :---- | :---- | :---- |
| 1 | Pemesanan ditutup pukul 12.00 | Waktu dihitung saat data sampai di peladen, bukan saat formulir dibuka |
| 2 | Ongkos kirim Rp10.000 | Berlaku tetap untuk seluruh pengiriman dalam kompleks |
| 3 | Jumlah porsi minimal satu | Pesanan berisi nol porsi tidak dapat dikirim |
| 4 | Status pesanan berurutan | Menunggu Pembayaran, Diproses, Dikirim, Selesai |
| 5 | Stok kembali saat pesanan dibatalkan | Berlaku untuk pembatalan sebelum maupun sesudah konfirmasi |
| 6 | Pesanan tanpa bukti bayar dibatalkan otomatis | Batas pukul 12.00 hari berikutnya, stok dikembalikan |
| 7 | Nomor WhatsApp bersifat unik | Satu nomor untuk satu pelanggan |
| 8 | Harga saat pemesanan disimpan terpisah | Perubahan harga menu tidak mengubah pesanan lama |
| 9 | Menu berstok nol tetap ditampilkan | Diberi tanda habis, tombol pesan dinonaktifkan |
| 10 | Menu tetap tampil setelah pukul 12.00 | Diberi keterangan pemesanan ditutup, seluruh tombol dinonaktifkan |

 

**5\. Aturan Mutlak**

Klien menyatakan tiga hal berikut tidak boleh terjadi dalam kondisi apa pun. Sistem menolak menyimpan data yang melanggarnya, bukan sekadar menampilkan peringatan.

| No | Aturan mutlak | Akibat bila dilanggar |
| :---- | :---- | :---- |
| 1 | Total tagihan tidak boleh kurang dari nol | Laporan penjualan mencatat pendapatan negatif dan rekapitulasi harian tidak dapat dipakai |
| 2 | Sisa porsi tidak boleh kurang dari nol | Dapur menerima pesanan yang bahannya tidak tersedia |
| 3 | Status pesanan tidak boleh melompat | Pesanan tercatat selesai tanpa pernah dimasak atau dibayar |

 

**6\. Laporan yang Dibutuhkan**

Klien meminta dua laporan saja.

1\.	Jumlah porsi terjual per menu pada tanggal tertentu, dipakai untuk menentukan belanja bahan hari berikutnya.

2\.	Total uang masuk pada tanggal tersebut.

Pesanan berstatus dibatalkan tidak dihitung pada kedua laporan.

**7\. Data yang Disimpan**

| Objek | Data |
| :---- | :---- |
| Pelanggan | Nama, nomor WhatsApp, alamat pengiriman |
| Menu | Nama menu, harga per porsi, sisa porsi harian, status ketersediaan |
| Pesanan | Pelanggan, daftar menu beserta porsi, total tagihan, status, bukti bayar, waktu pemesanan |

   
Alamat surel tidak disimpan atas permintaan klien. Foto menu dicatat sebagai kebutuhan opsional.

**8\. Catatan Teknis dari Diskusi**

| No | Catatan | Alasan |
| :---- | :---- | :---- |
| 1 | Nomor WhatsApp disimpan sebagai teks | Penyimpanan sebagai bilangan menghilangkan angka nol di awal |
| 2 | Nominal uang disimpan sebagai bilangan berkoma | Mengantisipasi perhitungan diskon berbentuk persentase |
| 3 | Waktu pemesanan dicatat | Dipakai menentukan urutan pesanan yang masuk lebih dulu |
| 4 | Tampilan diutamakan untuk layar telepon genggam | Kedua pengguna mengakses lewat telepon genggam |

 

**9\. Di Luar Lingkup Pengerjaan**

| Yang tidak dibangun | Alasan klien |
| :---- | :---- |
| Pembayaran daring otomatis | Transfer manual masih sanggup diperiksa sendiri |
| Pelacakan posisi kurir | Pengiriman ditangani satu kurir yang dapat dihubungi langsung |
| Aplikasi di toko aplikasi | Cukup dibuka lewat peramban |
| Program langganan bulanan | Ditunda sampai pemesanan harian berjalan stabil |

 

**10\. Kesepakatan Tindak Lanjut**

| No | Tindakan | Penanggung jawab |
| :---- | :---- | :---- |
| 1 | Menyusun PRD berdasarkan catatan rapat ini | Tim pengembang |
| 2 | Membaca dan menyetujui PRD | Dina |
| 3 | Menyusun rancangan data setelah PRD disetujui | Tim pengembang |

   
Setelah PRD disetujui, alur kerja, peran pengguna, dan aturan mutlak tidak diubah lagi. Perubahan warna, teks, dan tata letak masih dapat dilakukan.

   
Catatan rapat ini dibuat sebagai bahan pembelajaran. Nama, angka, dan peristiwa di dalamnya disusun untuk keperluan latihan.