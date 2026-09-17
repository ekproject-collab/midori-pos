-- =============================================================================
-- Midori POS — table numbers are no longer required for dine-in
--
-- The shop rarely has a fixed table available, so the kiosk checkout form no
-- longer asks for a "Nomor Meja". Dine-in orders are now identified the same
-- way takeaway ones already are: the queue number on the receipt. The column
-- stays (still writable, still shown by the admin/order-card UI if ever
-- populated) but is no longer required.
-- =============================================================================

alter table public.pesanan
  drop constraint if exists pesanan_meja_required_for_dinein;

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
