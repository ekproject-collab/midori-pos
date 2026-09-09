# Panduan Pemilik — Midori POS

Panduan singkat mengoperasikan sistem POS kiosk Midori sehari-hari.

---

## 1. Persiapan Awal (sekali saja)

1. **Tablet kiosk** di konter: buka browser, arahkan ke `https://<alamat-web-anda>/kiosk`.
   Sebaiknya set sebagai halaman awal / mode kiosk (fullscreen) di tablet.
2. **Stiker QRIS**: tempel kode QRIS statis toko di dekat kasir. Sistem hanya
   menampilkan instruksi "scan QRIS di kasir" — pembayaran tetap manual.
3. **Akun admin**: sudah dibuat di Supabase. Simpan email & password baik-baik.
4. Buka dashboard admin di `https://<alamat-web-anda>/admin` dari HP/laptop kasir.

---

## 2. Alur Pelanggan (Kiosk)

Pelanggan melakukan sendiri di tablet:

1. Tekan **Mulai Pesan** → pilih kategori → tekan **Tambah** pada menu.
2. Atur jumlah dengan tombol **+ / −**.
3. **Lihat Keranjang** → **Lanjut ke Checkout**.
4. Isi **Nama**, pilih **Dine-in / Takeaway** (isi **Nomor Meja** kalau Dine-in),
   pilih **Cash / QRIS**.
5. Tekan **Buat Pesanan** → muncul **Nomor Antrean** (mis. `#12`).
6. Pelanggan menunjukkan nomor antrean itu ke kasir untuk membayar.

---

## 3. Dashboard Admin

### Login
`/admin` → masukkan email & password. Tombol **Keluar** ada di kanan atas.

### Ringkasan Hari Ini (halaman Dashboard)
4 angka cepat: jumlah pesanan hari ini, pesanan yang **perlu diproses**,
pendapatan hari ini, dan status tutup buku. Klik kartunya untuk membuka
halaman terkait.

### Order Queue (`/admin/orders`)
Papan 3 kolom: **Baru → Sedang Disiapkan → Selesai**. Pesanan baru dari kiosk
**muncul otomatis** (ada bunyi "ting" — bisa dimatikan lewat tombol 🔔).

Untuk tiap pesanan:
- **Mulai Siapkan** → pindah ke kolom "Sedang Disiapkan".
- **Selesai** → pindah ke "Selesai".
- **Tandai Lunas** → tekan setelah pelanggan benar-benar membayar
  (Cash maupun QRIS). Semua pesanan mulai berstatus *Belum dibayar*.

> Kalau ada pesanan iseng/salah, biarkan saja atau tandai Selesai — selama
> tidak ditandai Lunas, tidak masuk hitungan uang.

### Produk & Kategori (`/admin/products`)
- **+ Tambah Produk**: isi nama, kategori, harga, deskripsi, gambar
  (JPG/PNG/WebP, maks 2 MB), centang "Tersedia".
- **Edit** / **Hapus**: hapus = produk disembunyikan dari kiosk, riwayat
  pesanan lama tetap aman.
- **Tersedia / Sold Out**: klik badge status di tabel untuk mengubah cepat.
  Menu Sold Out tetap tampil di kiosk tapi tidak bisa dipesan.
- **Kategori** (panel kanan): tambah, ubah nama, hapus. Kategori yang masih
  punya produk tidak bisa dihapus.

### Laporan / Close Order (`/admin/reports`)
- **Rekap Hari Ini**: total transaksi, pendapatan Cash, QRIS, dan total —
  dihitung dari **semua** pesanan hari ini.
- **Tutup Buku Hari Ini**: tekan di akhir jam operasional. Angka hari itu
  **dikunci** dan disimpan ke **Riwayat**. Tidak bisa tutup buku dua kali
  untuk tanggal yang sama.
- **Unduh CSV**: mengunduh seluruh riwayat rekap harian.

> Kalau ada pesanan masuk **setelah** tutup buku, angkanya tidak ikut ke rekap
> yang tersimpan. Jadi tutup buku betul-betul di akhir hari.

---

## 4. Rutinitas Harian

| Waktu | Tindakan |
| :--- | :--- |
| Buka toko | Nyalakan tablet kiosk, buka `/admin/orders` di perangkat kasir |
| Sepanjang hari | Proses pesanan di Order Queue, tandai **Lunas** setelah dibayar |
| Ada menu habis | `/admin/products` → klik badge jadi **Sold Out** |
| Tutup toko | `/admin/reports` → **Tutup Buku Hari Ini** |

---

## 5. Kalau Ada Masalah

- **Kiosk error / layar aneh** → tekan "Coba lagi", atau muat ulang halaman.
- **Pesanan tidak muncul di admin** → muat ulang `/admin/orders` (tombol
  **Segarkan**); pastikan perangkat online.
- **Tidak bisa login** → cek email/password; kalau lupa, reset lewat Supabase
  Dashboard → Authentication → Users.
- **Terlalu banyak pesanan iseng** → hubungi developer untuk menaikkan/menurunkan
  batas atau menambah verifikasi.
