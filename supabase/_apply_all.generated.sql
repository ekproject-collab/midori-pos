-- =============================================================================
-- GENERATED FILE — do not edit. Concatenation of migrations/ in order.
-- Regenerate: node scripts/build-sql.mjs
-- Paste this whole file into the Supabase SQL Editor to set up the database.
-- Then run seed.sql separately for development data.
-- =============================================================================


-- >>> migrations/20260909120000_init_schema.sql

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


-- >>> migrations/20260909120100_rls_policies.sql

-- =============================================================================
-- Midori POS — Phase 1: Row Level Security
-- Ref: PLAN.md Phase 1.
--
-- Model:
--   * anon (kiosk)  : read catalog only. Orders are created through the
--                     create_order() RPC (SECURITY DEFINER), never by direct
--                     INSERT, so anon needs no write policy on pesanan.
--   * authenticated : the single admin — full access to everything.
-- =============================================================================

alter table public.kategori       enable row level security;
alter table public.produk         enable row level security;
alter table public.pesanan        enable row level security;
alter table public.detail_pesanan enable row level security;
alter table public.rekap_harian   enable row level security;

-- ---------------------------------------------------------------------------
-- KATEGORI
-- ---------------------------------------------------------------------------
create policy "kategori: public read"
  on public.kategori for select
  to anon, authenticated
  using (true);

create policy "kategori: admin write"
  on public.kategori for all
  to authenticated
  using (true) with check (true);

-- ---------------------------------------------------------------------------
-- PRODUK
-- ---------------------------------------------------------------------------
-- Kiosk sees only non-deleted products (availability is handled in the UI as
-- "Sold Out", per PRD 2.2, so is_available is NOT filtered here).
create policy "produk: public read active"
  on public.produk for select
  to anon
  using (deleted_at is null);

-- Admin sees everything, including soft-deleted rows.
create policy "produk: admin read all"
  on public.produk for select
  to authenticated
  using (true);

create policy "produk: admin write"
  on public.produk for insert
  to authenticated
  with check (true);

create policy "produk: admin update"
  on public.produk for update
  to authenticated
  using (true) with check (true);

create policy "produk: admin delete"
  on public.produk for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- PESANAN / DETAIL_PESANAN  — admin only for direct access
-- ---------------------------------------------------------------------------
create policy "pesanan: admin all"
  on public.pesanan for all
  to authenticated
  using (true) with check (true);

create policy "detail_pesanan: admin all"
  on public.detail_pesanan for all
  to authenticated
  using (true) with check (true);

-- ---------------------------------------------------------------------------
-- REKAP_HARIAN — admin only
-- ---------------------------------------------------------------------------
create policy "rekap_harian: admin all"
  on public.rekap_harian for all
  to authenticated
  using (true) with check (true);


-- >>> migrations/20260909120200_rpc_functions.sql

-- =============================================================================
-- Midori POS — Phase 1: RPC functions
-- Ref: PLAN.md Phase 1 & 5 (atomic order create), Phase 9 (close order / recap).
-- All shop-day boundaries use Asia/Jakarta (WIB).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- create_order — atomic insert of pesanan + detail_pesanan
-- Called by the kiosk (anon). SECURITY DEFINER so it can write to tables that
-- anon has no direct policy on, and return the created row.
-- Prices are taken from the live catalog, never trusted from the client.
-- ---------------------------------------------------------------------------
create or replace function public.create_order(
  p_nama_pelanggan    text,
  p_tipe_pesanan      text,
  p_nomor_meja        text,
  p_metode_pembayaran text,
  p_items             jsonb
)
returns public.pesanan
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order      public.pesanan;
  v_lines      jsonb;
  v_total      integer;
  v_line_count integer;
begin
  if p_nama_pelanggan is null or length(btrim(p_nama_pelanggan)) = 0 then
    raise exception 'Nama pelanggan wajib diisi' using errcode = 'check_violation';
  end if;
  if p_tipe_pesanan not in ('dine_in', 'takeaway') then
    raise exception 'Tipe pesanan tidak valid' using errcode = 'check_violation';
  end if;
  if p_metode_pembayaran not in ('cash', 'qris') then
    raise exception 'Metode pembayaran tidak valid' using errcode = 'check_violation';
  end if;
  if p_tipe_pesanan = 'dine_in'
     and (p_nomor_meja is null or length(btrim(p_nomor_meja)) = 0) then
    raise exception 'Nomor meja wajib untuk dine-in' using errcode = 'check_violation';
  end if;
  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang kosong' using errcode = 'check_violation';
  end if;

  -- Resolve every cart line against the live catalog (available, not deleted).
  select
    jsonb_agg(jsonb_build_object(
      'id_produk', l.id_produk,
      'kuantitas', l.kuantitas,
      'harga_satuan', l.harga_satuan,
      'subtotal', l.subtotal
    )),
    coalesce(sum(l.subtotal), 0),
    count(*)
  into v_lines, v_total, v_line_count
  from (
    select
      i.id_produk,
      i.kuantitas,
      p.harga                  as harga_satuan,
      i.kuantitas * p.harga    as subtotal
    from jsonb_array_elements(p_items) as e
    cross join lateral (
      select
        (e ->> 'id_produk')::bigint  as id_produk,
        (e ->> 'kuantitas')::integer as kuantitas
    ) as i
    join public.produk p
      on p.id_produk = i.id_produk
     and p.deleted_at is null
     and p.is_available = true
    where i.kuantitas is not null and i.kuantitas > 0
  ) as l;

  if v_line_count <> jsonb_array_length(p_items) then
    raise exception 'Sebagian produk tidak tersedia atau kuantitas tidak valid'
      using errcode = 'no_data_found';
  end if;

  insert into public.pesanan (
    nama_pelanggan, tipe_pesanan, nomor_meja, metode_pembayaran, total_harga
  ) values (
    btrim(p_nama_pelanggan),
    p_tipe_pesanan,
    nullif(btrim(coalesce(p_nomor_meja, '')), ''),
    p_metode_pembayaran,
    v_total
  )
  returning * into v_order;

  insert into public.detail_pesanan (id_pesanan, id_produk, kuantitas, harga_satuan, subtotal)
  select
    v_order.id_pesanan,
    (line ->> 'id_produk')::bigint,
    (line ->> 'kuantitas')::integer,
    (line ->> 'harga_satuan')::integer,
    (line ->> 'subtotal')::integer
  from jsonb_array_elements(v_lines) as line;

  return v_order;
end;
$$;

revoke all on function public.create_order(text, text, text, text, jsonb) from public;
grant execute on function public.create_order(text, text, text, text, jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- get_daily_sales — live (unlocked) sales figures for a shop-day.
-- Counts ALL orders for the date, no status filter (business decision).
-- Used by the admin report screen before "Close Order".
-- ---------------------------------------------------------------------------
create or replace function public.get_daily_sales(
  p_tanggal date default (now() at time zone 'Asia/Jakarta')::date
)
returns table (
  tanggal                      date,
  total_transaksi              bigint,
  total_pendapatan_cash        bigint,
  total_pendapatan_qris        bigint,
  total_pendapatan_keseluruhan bigint,
  sudah_ditutup                boolean
)
language sql
security invoker
set search_path = public
as $$
  select
    p_tanggal,
    count(*),
    coalesce(sum(total_harga) filter (where metode_pembayaran = 'cash'), 0),
    coalesce(sum(total_harga) filter (where metode_pembayaran = 'qris'), 0),
    coalesce(sum(total_harga), 0),
    exists (select 1 from public.rekap_harian r where r.tanggal = p_tanggal)
  from public.pesanan
  where (waktu_pesanan at time zone 'Asia/Jakarta')::date = p_tanggal;
$$;

revoke all on function public.get_daily_sales(date) from public, anon;
grant execute on function public.get_daily_sales(date) to authenticated;

-- ---------------------------------------------------------------------------
-- close_daily_recap — "Tutup Buku". Locks the day's figures into rekap_harian.
-- Fails if the date is already closed (rekap_harian.tanggal is unique).
-- ---------------------------------------------------------------------------
create or replace function public.close_daily_recap(
  p_tanggal date default (now() at time zone 'Asia/Jakarta')::date
)
returns public.rekap_harian
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_row public.rekap_harian;
begin
  if exists (select 1 from public.rekap_harian where tanggal = p_tanggal) then
    raise exception 'Rekap tanggal % sudah ditutup', p_tanggal
      using errcode = 'unique_violation';
  end if;

  insert into public.rekap_harian (
    tanggal,
    total_transaksi,
    total_pendapatan_cash,
    total_pendapatan_qris,
    total_pendapatan_keseluruhan
  )
  select
    p_tanggal,
    count(*),
    coalesce(sum(total_harga) filter (where metode_pembayaran = 'cash'), 0),
    coalesce(sum(total_harga) filter (where metode_pembayaran = 'qris'), 0),
    coalesce(sum(total_harga), 0)
  from public.pesanan
  where (waktu_pesanan at time zone 'Asia/Jakarta')::date = p_tanggal
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.close_daily_recap(date) from public, anon;
grant execute on function public.close_daily_recap(date) to authenticated;


-- >>> migrations/20260909120300_realtime.sql

-- =============================================================================
-- Midori POS — Phase 1: enable Realtime on pesanan
-- The admin Order Queue (Phase 7) subscribes to live inserts/updates.
-- =============================================================================

alter publication supabase_realtime add table public.pesanan;


-- >>> migrations/20260909120400_fix_function_grants.sql

-- =============================================================================
-- Midori POS — Phase 1 fix: lock down admin-only RPCs from anon
--
-- Supabase auto-grants EXECUTE on every new function in `public` to the `anon`
-- and `authenticated` roles (via default privileges), so `revoke ... from
-- public` in the previous migration was not enough. Revoke explicitly.
--
-- create_order stays callable by anon — that is the kiosk's order path.
-- =============================================================================

revoke execute on function public.get_daily_sales(date) from anon;
revoke execute on function public.close_daily_recap(date) from anon;


-- >>> migrations/20260909120500_storage_produk_images.sql

-- =============================================================================
-- Midori POS — Phase 8: Supabase Storage bucket for product images
-- Public bucket (anyone can read the image URL); only the admin uploads.
-- Re-runnable.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'produk-images',
  'produk-images',
  true,
  2097152,                                    -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "produk-images public read" on storage.objects;
create policy "produk-images public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'produk-images');

drop policy if exists "produk-images admin insert" on storage.objects;
create policy "produk-images admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'produk-images');

drop policy if exists "produk-images admin update" on storage.objects;
create policy "produk-images admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'produk-images')
  with check (bucket_id = 'produk-images');

drop policy if exists "produk-images admin delete" on storage.objects;
create policy "produk-images admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'produk-images');


-- >>> migrations/20260909120600_rate_limit_orders.sql

-- =============================================================================
-- Midori POS — Phase 10: order flood protection
--
-- create_order() is callable by anon (the kiosk). This caps how many orders a
-- single client IP can create in a rolling window so a script cannot spam the
-- queue. Payment is still cashier-verified, so this is about noise, not money.
--
-- Tune V_LIMIT / V_WINDOW below for a busier counter (all orders from the shop
-- tablet share one IP). Re-runnable.
-- =============================================================================

create table if not exists public.order_rate_limit (
  ip           text        primary key,
  window_start timestamptz not null default now(),
  count        integer     not null default 0
);

alter table public.order_rate_limit enable row level security;
-- no policies: only the SECURITY DEFINER function below touches this table.

comment on table public.order_rate_limit is
  'Per-IP rolling counter for create_order flood protection. Safe to truncate.';

create or replace function public.create_order(
  p_nama_pelanggan    text,
  p_tipe_pesanan      text,
  p_nomor_meja        text,
  p_metode_pembayaran text,
  p_items             jsonb
)
returns public.pesanan
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order      public.pesanan;
  v_lines      jsonb;
  v_total      integer;
  v_line_count integer;
  v_ip         text;
  v_rl_count   integer;
  v_limit      constant integer  := 30;
  v_window     constant interval := interval '5 minutes';
begin
  -- ---- flood protection ----------------------------------------------------
  begin
    v_ip := btrim(
      split_part(
        coalesce(
          current_setting('request.headers', true)::json ->> 'x-forwarded-for',
          'unknown'
        ),
        ',',
        1
      )
    );
  exception when others then
    v_ip := 'unknown';
  end;
  if v_ip is null or v_ip = '' then
    v_ip := 'unknown';
  end if;

  insert into public.order_rate_limit as rl (ip, window_start, count)
  values (v_ip, now(), 1)
  on conflict (ip) do update set
    window_start = case
      when rl.window_start < now() - v_window then now()
      else rl.window_start
    end,
    count = case
      when rl.window_start < now() - v_window then 1
      else rl.count + 1
    end
  returning count into v_rl_count;

  if v_rl_count > v_limit then
    raise exception
      'Terlalu banyak pesanan dari perangkat ini. Mohon tunggu beberapa menit.'
      using errcode = 'check_violation';
  end if;

  -- ---- validation --------------------------------------------------------
  if p_nama_pelanggan is null or length(btrim(p_nama_pelanggan)) = 0 then
    raise exception 'Nama pelanggan wajib diisi' using errcode = 'check_violation';
  end if;
  if p_tipe_pesanan not in ('dine_in', 'takeaway') then
    raise exception 'Tipe pesanan tidak valid' using errcode = 'check_violation';
  end if;
  if p_metode_pembayaran not in ('cash', 'qris') then
    raise exception 'Metode pembayaran tidak valid' using errcode = 'check_violation';
  end if;
  if p_tipe_pesanan = 'dine_in'
     and (p_nomor_meja is null or length(btrim(p_nomor_meja)) = 0) then
    raise exception 'Nomor meja wajib untuk dine-in' using errcode = 'check_violation';
  end if;
  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang kosong' using errcode = 'check_violation';
  end if;

  -- ---- resolve lines against the live catalog ---------------------------
  select
    jsonb_agg(jsonb_build_object(
      'id_produk', l.id_produk,
      'kuantitas', l.kuantitas,
      'harga_satuan', l.harga_satuan,
      'subtotal', l.subtotal
    )),
    coalesce(sum(l.subtotal), 0),
    count(*)
  into v_lines, v_total, v_line_count
  from (
    select
      i.id_produk,
      i.kuantitas,
      p.harga                  as harga_satuan,
      i.kuantitas * p.harga    as subtotal
    from jsonb_array_elements(p_items) as e
    cross join lateral (
      select
        (e ->> 'id_produk')::bigint  as id_produk,
        (e ->> 'kuantitas')::integer as kuantitas
    ) as i
    join public.produk p
      on p.id_produk = i.id_produk
     and p.deleted_at is null
     and p.is_available = true
    where i.kuantitas is not null and i.kuantitas > 0
  ) as l;

  if v_line_count <> jsonb_array_length(p_items) then
    raise exception 'Sebagian produk tidak tersedia atau kuantitas tidak valid'
      using errcode = 'no_data_found';
  end if;

  insert into public.pesanan (
    nama_pelanggan, tipe_pesanan, nomor_meja, metode_pembayaran, total_harga
  ) values (
    btrim(p_nama_pelanggan),
    p_tipe_pesanan,
    nullif(btrim(coalesce(p_nomor_meja, '')), ''),
    p_metode_pembayaran,
    v_total
  )
  returning * into v_order;

  insert into public.detail_pesanan (id_pesanan, id_produk, kuantitas, harga_satuan, subtotal)
  select
    v_order.id_pesanan,
    (line ->> 'id_produk')::bigint,
    (line ->> 'kuantitas')::integer,
    (line ->> 'harga_satuan')::integer,
    (line ->> 'subtotal')::integer
  from jsonb_array_elements(v_lines) as line;

  return v_order;
end;
$$;

revoke all on function public.create_order(text, text, text, text, jsonb) from public;
grant execute on function public.create_order(text, text, text, text, jsonb) to anon, authenticated;

