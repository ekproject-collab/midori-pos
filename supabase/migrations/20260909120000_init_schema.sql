-- =============================================================================
-- Midori POS — Phase 1: initial schema
-- Ref: PRD.md Section 3 (ERD). Column & table names follow the PRD verbatim.
-- Business rules baked in here (see PLAN.md "Catatan Lintas-Fase"):
--   * pesanan.status_pembayaran defaults to 'unpaid' (admin verifies payment)
--   * produk uses soft delete via deleted_at
-- =============================================================================

-- ---------------------------------------------------------------------------
-- KATEGORI
-- ---------------------------------------------------------------------------
create table public.kategori (
  id_kategori   bigint generated always as identity primary key,
  nama_kategori text        not null unique,
  created_at    timestamptz not null default now()
);

comment on table public.kategori is 'Kategori menu (Matcha, Coffee, dll).';

-- ---------------------------------------------------------------------------
-- PRODUK
-- ---------------------------------------------------------------------------
create table public.produk (
  id_produk    bigint generated always as identity primary key,
  id_kategori  bigint      not null references public.kategori (id_kategori) on delete restrict,
  nama_produk  text        not null,
  deskripsi    text,
  harga        integer     not null check (harga >= 0),
  gambar_url   text,
  is_available boolean      not null default true,
  deleted_at   timestamptz,                       -- soft delete; null = active
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on column public.produk.deleted_at is 'Soft delete marker. Rows with a value are hidden from kiosk and default admin lists but stay referenced by detail_pesanan.';

create index produk_id_kategori_idx on public.produk (id_kategori);
create index produk_active_idx on public.produk (id_kategori) where deleted_at is null;

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger produk_set_updated_at
  before update on public.produk
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- PESANAN
-- ---------------------------------------------------------------------------
create table public.pesanan (
  id_pesanan        bigint generated always as identity primary key,
  nama_pelanggan    text        not null,
  tipe_pesanan      text        not null check (tipe_pesanan in ('dine_in', 'takeaway')),
  nomor_meja        text,
  metode_pembayaran text        not null check (metode_pembayaran in ('cash', 'qris')),
  status_pembayaran text        not null default 'unpaid' check (status_pembayaran in ('unpaid', 'paid')),
  status_pesanan    text        not null default 'new' check (status_pesanan in ('new', 'preparing', 'done')),
  total_harga       integer     not null check (total_harga >= 0),
  waktu_pesanan     timestamptz not null default now(),
  -- dine-in orders must carry a table number
  constraint pesanan_meja_required_for_dinein
    check (tipe_pesanan <> 'dine_in' or (nomor_meja is not null and length(btrim(nomor_meja)) > 0))
);

comment on table public.pesanan is 'Header pesanan. id_pesanan doubles as the customer queue number.';

create index pesanan_waktu_idx on public.pesanan (waktu_pesanan);
create index pesanan_status_idx on public.pesanan (status_pesanan);

-- ---------------------------------------------------------------------------
-- DETAIL_PESANAN
-- ---------------------------------------------------------------------------
create table public.detail_pesanan (
  id_detail    bigint generated always as identity primary key,
  id_pesanan   bigint  not null references public.pesanan (id_pesanan) on delete cascade,
  id_produk    bigint  not null references public.produk (id_produk) on delete restrict,
  kuantitas    integer not null check (kuantitas > 0),
  harga_satuan integer not null check (harga_satuan >= 0),   -- price snapshot at order time
  subtotal     integer not null check (subtotal >= 0)
);

comment on column public.detail_pesanan.harga_satuan is 'Snapshot of produk.harga at order time — never join to the live price.';

create index detail_pesanan_id_pesanan_idx on public.detail_pesanan (id_pesanan);
create index detail_pesanan_id_produk_idx on public.detail_pesanan (id_produk);

-- ---------------------------------------------------------------------------
-- REKAP_HARIAN
-- ---------------------------------------------------------------------------
create table public.rekap_harian (
  id_rekap                     bigint generated always as identity primary key,
  tanggal                      date        not null unique,   -- unique => cannot close twice
  total_transaksi              integer     not null default 0,
  total_pendapatan_cash        integer     not null default 0,
  total_pendapatan_qris        integer     not null default 0,
  total_pendapatan_keseluruhan integer     not null default 0,
  waktu_tutup                  timestamptz not null default now()
);

comment on table public.rekap_harian is 'Locked daily sales summary written when the admin closes the books.';
