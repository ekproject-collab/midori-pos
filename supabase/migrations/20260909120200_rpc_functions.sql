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

revoke all on function public.get_daily_sales(date) from public;
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

revoke all on function public.close_daily_recap(date) from public;
grant execute on function public.close_daily_recap(date) to authenticated;
