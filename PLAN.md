# Development Plan — Matcha & Coffee Kiosk POS

Rencana eksekusi bertahap untuk membangun sistem dari nol sampai production di Vercel.
Setiap fase punya **tujuan**, **tugas**, **deliverable**, **acuan PRD**, dan **kriteria selesai (DoD)**.

> Acuan wajib: [PRD.md](PRD.md) untuk scope, [AGENTS.md](AGENTS.md) untuk aturan arsitektur & UI.
> Sebelum mengerjakan tiap fase, konfirmasi ulang scope ke PRD (AGENTS.md Section 0).

---

## Ringkasan Fase

| Fase | Nama | Fokus | Estimasi |
| :--- | :--- | :--- | :--- |
| 0 | Fondasi & Infrastruktur | Setup repo, Next.js, Tailwind, Supabase, Vercel | 0.5 hari |
| 1 | Skema Database & Data Layer | Tabel, RLS, seed, service layer Supabase | 1 hari |
| 2 | Design System | Token warna, tipografi, komponen dasar (flat, anti-AI) | 1 hari |
| 3 | Kiosk — Katalog Menu | Home, list kategori & produk, status Sold Out | 1 hari |
| 4 | Kiosk — Keranjang & Checkout | Cart state, qty, form checkout, metode bayar | 1.5 hari |
| 5 | Kiosk — Konfirmasi Pesanan | Submit order ke DB, struk digital / nomor antrean | 0.5 hari |
| 6 | Admin — Autentikasi | Login single admin, proteksi route `/admin` | 0.5 hari |
| 7 | Admin — Order Queue | List/Kanban realtime, ubah status pesanan & pembayaran | 1.5 hari |
| 8 | Admin — Manajemen Produk | CRUD kategori & produk, toggle availability, upload gambar | 1.5 hari |
| 9 | Admin — Close Order & Rekap | Kalkulasi harian, tutup buku, riwayat rekap | 1.5 hari |
| 10 | Hardening & Deployment | Error handling, QA, responsive tablet, deploy production | 1 hari |

Total estimasi kasar: **~12 hari kerja** (solo dev).

---

## Fase 0 — Fondasi & Infrastruktur  ✅ (kode) / ⏳ (aksi eksternal)

**Tujuan:** Kerangka project jalan lokal & terhubung ke Supabase, deploy pipeline siap.

**Tugas:**
- [x] `git init`, `.gitignore` (branch `main`, commit awal `d9c1ccc`). Push ke GitHub → **user**.
- [x] Scaffold Next.js 16 (App Router, TS, Turbopack) + Tailwind v4.
- [x] Struktur folder: `src/app/{kiosk,admin}`, `src/services/supabase/`, `src/lib/`, `src/components/ui/`, `src/hooks/`, `src/types/`.
- [ ] Buat project Supabase (Free Tier), simpan URL & anon key → **user**.
- [x] Env: `.env.local` (kosong) + `.env.example`; `.env.example` di-whitelist di `.gitignore`.
- [x] Supabase client tunggal `src/services/supabase/client.ts` (`getSupabaseClient()`, lazy + memoised) + `src/lib/env.ts` (validasi lazy, `hasSupabaseEnv()`).
- [ ] Hubungkan repo ke Vercel, set env vars, deploy pertama → **user**.
- [x] ESLint (bawaan Next) + Prettier + `prettier-plugin-tailwindcss`, alias `@/*`, script `format` / `format:check`.

**Deliverable:** Repo + deployment Vercel hidup, koneksi Supabase terverifikasi.
**Acuan PRD:** 1.2 Tech Stack & Arsitektur.
**DoD:** `npm run dev` jalan tanpa error ✅ · `npm run build` sukses ✅ (`/`, `/kiosk`, `/admin` prerender static) · halaman tampil di URL Vercel ⏳ (butuh deploy user) · client Supabase fetch dummy ⏳ (health check siap, butuh env vars).

**Sisa aksi user sebelum Fase 1:**
1. Buat project Supabase, isi `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` di `.env.local`.
2. Buat repo GitHub, `git remote add origin …`, `git push -u origin main`.
3. Import repo ke Vercel, set 2 env vars yang sama, deploy.

**Catatan:** `next dev` otomatis menambah blok `<!-- BEGIN:nextjs-agent-rules -->` di `AGENTS.md` (fitur Next 16). Di-commit apa adanya; nonaktifkan dengan `agentRules: false` di `next.config.ts` bila tidak diinginkan.

---

## Fase 1 — Skema Database & Data Access Layer  ✅ SELESAI (diverifikasi `npm run db:verify`, 10/10)

**Tujuan:** Semua tabel sesuai ERD ada, aman, dan diakses lewat service layer (bukan langsung dari komponen).

**Tugas:**
- [x] Migrasi SQL 5 tabel (PRD Section 3) di `supabase/migrations/`:
  - `20260909120000_init_schema.sql` — tabel + CHECK (`tipe_pesanan`, `metode_pembayaran`, `status_pembayaran`, `status_pesanan`) + default (`is_available=true`, `waktu_pesanan=now()`, `status_pembayaran='unpaid'`, `status_pesanan='new'`) + `produk.deleted_at` (soft delete) + index + trigger `updated_at`. PK = `bigint identity` (`id_pesanan` sekaligus nomor antrean).
  - `20260909120100_rls_policies.sql` — RLS semua tabel.
  - `20260909120200_rpc_functions.sql` — `create_order` (atomik, SECURITY DEFINER, re-pricing dari katalog), `get_daily_sales` (live, hitung semua order), `close_daily_recap` (tutup buku, unique per tanggal). Batas hari = Asia/Jakarta.
  - `20260909120300_realtime.sql` — `pesanan` masuk publication realtime.
- [x] RLS: anon hanya `SELECT` katalog (produk non-deleted); pesanan **tidak** ada INSERT langsung — lewat RPC `create_order` (lebih aman, harga dari server). Admin (authenticated) full akses.
- [x] Seed `supabase/seed.sql` — menu Midori asli: 4 kategori (Matcha/Coffee/Es Series/Snack), 27 produk.
- [x] Data access layer `src/services/supabase/`: `categories.ts`, `products.ts`, `orders.ts`, `recap.ts`, + `result.ts` (`Result<T>` = `{data,error}`, mapping error → pesan ID), barrel `index.ts`.
- [x] Tipe `src/types/database.ts` (hand-written, siap diganti `supabase gen types`) + `src/types/index.ts` (alias domain).
- [x] `npm run build` / `tsc --noEmit` hijau.

**Deliverable:** Migrasi SQL commit di repo (`supabase/migrations/`), service layer + tipe.
**Acuan PRD:** Section 3 (ERD), AGENTS.md Section 2 (SoC, isolasi Supabase).
**DoD:** Query produk & kategori dari service layer berhasil ✅ · insert pesanan (RPC) berhasil ✅ · RLS mencegah anon menulis ke `produk` ✅ · RPC admin tertutup dari anon ✅ — `npm run db:verify` 10/10.

**Catatan:** migrasi `20260909120400_fix_function_grants.sql` ditambahkan setelah verifikasi (Supabase auto-grant execute ke `anon`, harus di-revoke eksplisit). `scripts/verify-db.mjs` menyisakan pesanan uji tiap run — **re-run `supabase/seed.sql` sekali sebelum Fase 3** untuk bersih.

---

## Fase 2 — Design System (Flat / Anti-AI)  ✅ SELESAI

**Tujuan:** Bahasa visual konsisten sebelum bikin halaman, sesuai AGENTS.md Section 1.

**Tugas:**
- [x] Token di `src/app/globals.css` via `@theme` (Tailwind v4, CSS-based): palet `matcha-*` (earthy green), `coffee-*` (deep brown), `cream-*` (off-white `#FAF8F5`), `ink-*` (teks), status `success/warning/danger/info`, alias semantik (`background/surface/border/foreground/muted/primary`), `--shadow-hard*` (offset, 0 blur), radius kecil. Tanpa gradient, tanpa glassmorphism.
- [x] Font: Geist Sans (via `next/font`), `.kiosk-root` menaikkan base size untuk keterbacaan tablet; focus ring global.
- [x] Komponen `src/components/ui/`: `Button` (4 varian × 3 size), `Card`/`CardHeader`/`CardBody`, `Badge` (6 tone), `QuantityStepper`, `Field`/`Input`/`Select`, `Modal` (scrim solid, no blur), `EmptyState`, `Spinner`/`Skeleton`, `Toast` (`ToastProvider` + `useToast`). Barrel `index.ts`. Helper `src/lib/cn.ts`, `src/lib/format.ts` (`formatRupiah`, dll).
- [x] Layout shell: `src/components/layout/KioskShell.tsx` (landscape tablet, header + sticky footer slot), `AdminShell.tsx` (sidebar nav + active link, desktop).
- [x] `src/app/style-guide/page.tsx` — showcase semua token & komponen. Placeholder `/`, `/kiosk`, `/admin` dipindah ke shell + token baru.

**Deliverable:** Config Tailwind + library komponen + style guide.
**Acuan PRD:** 1.2; AGENTS.md Section 1 & 4.
**DoD:** Komponen tampil di `/style-guide` ✅ · `npm run build` (5 route) + `tsc` + `lint` hijau ✅ · cek "no gradient / no glassmorphism": 0 class gradient/blur/backdrop di HTML ter-render `/`, `/kiosk`, `/admin`, `/style-guide` ✅.

---

## Fase 3 — Kiosk: Katalog Menu  ✅ SELESAI

**Tujuan:** Pelanggan bisa menjelajah menu per kategori.

**Tugas:**
- [x] `src/app/kiosk/page.tsx` — Home: sambutan + tombol besar "Mulai Pesan" → `/kiosk/menu`.
- [x] `src/app/kiosk/menu/page.tsx` + `src/components/kiosk/MenuBrowser.tsx` — tab kategori (filter satu kategori, default kategori pertama), grid 2/3/4 kolom responsif.
- [x] `ProductCard` — `ProductImage` (fallback 茶 bermerek, `<img>` untuk sekarang; next/image + Storage di Fase 8), nama, deskripsi (line-clamp 2), harga (`formatRupiah`), slot `action` untuk tombol cart Fase 4.
- [x] Produk `is_available = false` → `opacity-60` + badge "Sold Out".
- [x] Hook `src/hooks/useCatalog.ts` — panggil `listCategories` + `listCatalogProducts`, grouping per kategori, `{ loading, error, refetch }`.
- [x] Loading: skeleton grid. Error: `EmptyState` + "Coba lagi" (refetch). `src/app/kiosk/error.tsx` — error boundary segmen kiosk (tidak pernah crash screen di depan pelanggan).

**Deliverable:** Alur browsing kiosk fungsional (belum ada cart).
**Acuan PRD:** 2.1.A langkah 1–3, 2.2 Menu Catalog.
**DoD:** Menu load dari Supabase (27 produk, 4 kategori terverifikasi) ✅ · tab kategori berpindah ✅ · Sold Out styling di `ProductCard` ✅ · error → EmptyState + retry, error boundary aktif ✅ · build (6 route) + tsc + lint hijau ✅.

---

## Fase 4 — Kiosk: Keranjang & Checkout  ✅ SELESAI

**Tujuan:** Pelanggan menyusun pesanan dan mengisi form checkout.

**Tugas:**
- [x] Cart logic murni di `src/lib/cart/` (`types.ts`, `reducer.ts` + selektor `selectSubtotal/selectItemCount/selectLineSubtotal/selectQuantityOf`) — tanpa React/IO, qty di-clamp 0..99 integer, qty 0 = hapus baris.
- [x] `src/lib/cart/reducer.test.ts` (9 test) + `src/lib/checkout/validate.test.ts` (4 test) via `node:test`/`tsx` — `npm test` 13/13 hijau.
- [x] `CartProvider` (Context + `useReducer`) + `useCart()`, sinkron ke `localStorage` (`midori-cart-v1`, hidrasi via effect agar tak mismatch SSR). Dipasang di `src/app/kiosk/layout.tsx`.
- [x] Tombol +/-: `AddToCartControl` di kartu produk (tombol "Tambah" → `QuantityStepper`; "Sold Out" disabled) & `QuantityStepper` di halaman keranjang.
- [x] `CartBar` (sticky footer di menu, muncul saat ada isi) → `/kiosk/cart`.
- [x] `/kiosk/cart` (`CartView`): daftar item + qty + hapus + kosongkan, subtotal per baris, total, "Lanjut ke Checkout". Empty state.
- [x] `/kiosk/checkout` (`CheckoutForm` + `OrderSummary`): **Nama**, **Tipe Pesanan** (segmented), **Nomor Meja** (muncul hanya jika Dine-in), **Metode Pembayaran** (Cash/QRIS). Validasi `src/lib/checkout/validate.ts` (mirror constraint DB), error tampil setelah submit, tombol disabled saat `submitting`. Cart kosong → redirect ke menu.

**Deliverable:** Cart + form checkout siap submit.
**Acuan PRD:** 2.1.A langkah 3–5, 2.2 Shopping Cart & Order Checkout.
**DoD:** Total dihitung benar (unit test) ✅ · field meja kondisional ✅ · validasi mencegah submit tak lengkap ✅ · build (8 route) + tsc + lint hijau ✅. **Submit RPC + struk = Fase 5** (handler checkout saat ini stub: toast + `console.info`).

---

## Fase 5 — Kiosk: Konfirmasi Pesanan

## Fase 5 — Kiosk: Konfirmasi Pesanan  ✅ SELESAI

**Tujuan:** Pesanan tersimpan ke DB dan pelanggan dapat bukti.

**Tugas:**
- [x] Checkout `handleSubmit` → `createOrder()` (RPC `create_order`, dari Fase 1) — atomik `pesanan` + `detail_pesanan`, snapshot `harga_satuan`/`subtotal`, re-priced server-side.
- [x] Status awal `new` / `unpaid` selalu (diverifikasi end-to-end: order dine-in QRIS → `status_pembayaran='unpaid'`, `status_pesanan='new'`, total cocok dengan re-pricing).
- [x] `OrderConfirmation` (inline di `/kiosk/checkout` setelah sukses): nomor antrean `#id_pesanan` besar, nama + waktu, badge tipe/meja/metode/"Belum dibayar", daftar item + total, instruksi bayar (QRIS: scan di kasir · Cash: bayar tunai sebut nomor).
- [x] Tombol "Pesan Lagi" → `clear()` + `router.push('/kiosk')`.
- [x] Error handling: RPC gagal → `toast` danger, `submitting` reset, **cart tidak di-clear** (bisa retry). Redirect-ke-menu di-guard agar tak jalan di state sukses.

**Deliverable:** Alur kiosk end-to-end selesai.
**Acuan PRD:** 2.1.A langkah 6.
**DoD:** Order masuk ke Supabase dengan detail benar ✅ (end-to-end test: trim nama/meja, total re-priced, dine-in tanpa meja ditolak, produk tak dikenal ditolak) · kegagalan tidak menghilangkan pesanan pelanggan ✅ · build (8 route) + tsc + lint + 13 test hijau ✅.

**Catatan:** QRIS masih instruksi teks (gambar QRIS statis = aset dari owner, Fase 10). DB kini berisi 1 pesanan uji (`#1`) — berguna untuk Fase 7, atau re-run `seed.sql` untuk bersih.

---

## Fase 6 — Admin: Autentikasi

**Tujuan:** Dashboard `/admin` hanya untuk pemilik.

**Tugas:**
- Supabase Auth email+password; buat 1 akun admin manual.
- Halaman `/admin/login`.
- Middleware Next.js proteksi semua route `/admin/*`, redirect ke login bila belum auth.
- Helper session server & client, tombol logout.
- (Opsional) batasi ke satu email admin lewat cek di middleware.

**Deliverable:** Gate autentikasi berfungsi.
**Acuan PRD:** 2.1.B langkah 1, 1.1 (single admin).
**DoD:** Akses `/admin` tanpa login → redirect; login benar → masuk; logout → sesi bersih.

---

## Fase 7 — Admin: Order Queue (Realtime)

**Tujuan:** Pemilik memantau & memproses pesanan masuk secara real-time.

**Tugas:**
- `app/admin/orders/page.tsx` — List atau Kanban 3 kolom: New → Preparing → Done.
- Supabase Realtime subscription pada tabel `pesanan` (auto-update saat order baru).
- Aksi ubah status pesanan (tombol/drag) → `orders.updateStatus()`.
- Toggle `status_pembayaran` → Paid (untuk Cash).
- Detail pesanan: item, qty, tipe, meja, metode bayar, waktu.
- Indikator visual pesanan baru (highlight / suara opsional).
- Filter: tampilkan hari ini secara default.

**Deliverable:** Papan order operasional.
**Acuan PRD:** 2.1.B langkah 2–3, 2.2 Order Management.
**DoD:** Order baru dari kiosk muncul < 2 detik tanpa refresh; perubahan status persist di DB; tandai Paid bekerja.

---

## Fase 8 — Admin: Manajemen Produk & Kategori

**Tujuan:** Pemilik mengelola katalog sendiri.

**Tugas:**
- `app/admin/products/` — tabel produk: nama, kategori, harga, status.
- CRUD Produk: create/edit (form: nama, kategori, deskripsi, harga, gambar), delete = **soft delete** (set `deleted_at = now()`) + konfirmasi. Semua query kiosk & list admin default filter `deleted_at is null`.
- Toggle **Available / Sold Out** langsung dari list.
- CRUD Kategori (sederhana: nama).
- Upload gambar ke Supabase Storage, simpan `gambar_url`; validasi ukuran/tipe.
- Guard: cegah hapus kategori yang masih punya produk.

**Deliverable:** Katalog dikelola penuh lewat dashboard.
**Acuan PRD:** 2.1.B langkah 4, 2.2 Product Management.
**DoD:** Tambah/edit/hapus produk & kategori tercermin di kiosk; toggle Sold Out langsung berpengaruh; upload gambar tampil.

---

## Fase 9 — Admin: Close Order & Rekap Harian

**Tujuan:** Tutup buku harian yang mengunci & menyimpan ringkasan penjualan.

**Tugas:**
- `app/admin/reports/page.tsx` — rekap hari berjalan (live):
  - total transaksi, pendapatan Cash, pendapatan QRIS, total keseluruhan.
  - Hitung dari **semua** `pesanan` pada tanggal itu (tanpa filter `status_pesanan` / `status_pembayaran`). Breakdown Cash vs QRIS berdasar `metode_pembayaran`.
- Tombol **"Tutup Buku Hari Ini"**:
  - Postgres function menghitung agregat & insert ke `rekap_harian` (`tanggal`, `total_transaksi`, `total_pendapatan_cash`, `total_pendapatan_qris`, `total_pendapatan_keseluruhan`, `waktu_tutup`).
  - Cegah double close untuk tanggal sama (unique pada `tanggal` + konfirmasi UI).
- Riwayat rekap: tabel `rekap_harian` terurut tanggal, dengan detail per hari.
- (Opsional) export CSV.

**Deliverable:** Fitur tutup buku + arsip laporan harian.
**Acuan PRD:** 1 (ringkasan), 2.1.B langkah 5–6, 2.2 Close Order & Recap, Section 3 tabel `rekap_harian`.
**DoD:** Angka rekap live cocok dengan data pesanan; klik tutup buku menyimpan 1 baris `rekap_harian` yang benar; tidak bisa close dua kali; riwayat tampil.

---

## Fase 10 — Hardening, QA & Deployment

**Tujuan:** Siap dipakai produksi di kedai.

**Tugas:**
- Error boundary global + fallback ramah untuk kiosk (auto-recover / tombol reload).
- Review semua path Supabase menangani `error` (AGENTS.md Section 3).
- Uji responsif: tablet landscape (kiosk), desktop (admin); target device nyata.
- Audit aksesibilitas dasar: kontras, ukuran sentuh, focus state.
- Audit UI vs AGENTS.md Section 1 (no gradient, no glassmorphism, flat, palet benar).
- Uji beban ringan: banyak order berturut-turut, realtime stabil.
- Seed data produksi (menu asli), buat akun admin final, siapkan QRIS.
- Konfigurasi domain Vercel, env production, aktifkan backup Supabase.
- Smoke test end-to-end: kiosk order → admin proses → tutup buku.
- Dokumentasi singkat: cara pakai untuk owner + `README.md`.

**Deliverable:** Rilis produksi v1.0.
**Acuan PRD:** seluruh dokumen.
**DoD:** Alur lengkap lolos di environment produksi; tidak ada error konsol kritis; owner bisa operasikan tanpa bantuan.

---

## Catatan Lintas-Fase

- **Out-of-Scope (jangan dibuat):** add-ons/modifier, diskon/promo, inventaris/stok, multi-role & shift, membership/poin. (PRD 1.1)
- **Urutan kritis:** Fase 0 → 1 → 2 wajib lebih dulu. Fase 3–5 (kiosk) dan 6–9 (admin) bisa paralel setelah fondasi, tapi Fase 7 & 9 butuh data order dari Fase 5.
- **Testing:** minimal unit test untuk logika cart & kalkulasi rekap (AGENTS.md Section 2). Sisanya manual/smoke test.
- **Keputusan yang sudah difinalkan owner:**
  1. **Status pembayaran:** semua pesanan mulai `status_pembayaran = unpaid`. Hanya admin yang mengubah ke `paid` setelah verifikasi (Cash maupun QRIS). Tidak ada auto-paid dari kiosk.
  2. **Rekap harian:** menghitung **semua** pesanan pada tanggal tersebut, tanpa filter status (asumsi operasional: semua order berakhir `done` & `paid`).
  3. **Hapus produk:** **soft delete** — kolom `deleted_at` (atau `is_deleted`) pada `produk`. Produk terhapus disembunyikan dari kiosk & list admin default, tapi tetap tereferensi oleh `detail_pesanan` lama.
