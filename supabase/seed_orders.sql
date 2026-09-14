-- =============================================================================
-- Midori POS — DEV/TEST ONLY seed: sample orders for the admin Order Queue
--
-- Creates 24 synthetic orders for TODAY, split 8 "new" / 7 "preparing" /
-- 9 "done" — every column has more than 5 items so pagination (Fase: Order
-- Queue paginates 5/halaman) actually has something to page through.
-- Mixes dine-in/takeaway, cash/qris, and paid/unpaid.
--
-- Requires the catalog to already be seeded (supabase/seed.sql).
-- Re-runnable: TRUNCATEs pesanan first (cascades to detail_pesanan).
--
-- ⚠️ NEVER run this against a real shop's data — it wipes ALL orders,
-- including legitimate history. Dev/staging projects only.
-- =============================================================================

truncate table public.pesanan restart identity cascade;

do $$
declare
  v_customer_names text[] := array[
    'Andi','Budi','Citra','Dewi','Eka','Fajar','Gita','Hana',
    'Indra','Joko','Kirana','Lestari','Made','Nadia','Oki','Putri'
  ];
  v_product_ids   bigint[];
  v_product_count integer;
  v_status        text[] := array[
    'new','new','new','new','new','new','new','new',
    'preparing','preparing','preparing','preparing','preparing','preparing','preparing',
    'done','done','done','done','done','done','done','done','done'
  ];
  v_count      integer := array_length(v_status, 1);
  v_i          integer;
  v_id_pesanan bigint;
  v_tipe       text;
  v_meja       text;
  v_metode     text;
  v_bayar      text;
  v_n_items    integer;
  v_total      integer;
  v_j          integer;
  v_pid        bigint;
  v_harga      integer;
  v_qty        integer;
begin
  select array_agg(id_produk order by id_produk)
    into v_product_ids
  from public.produk
  where deleted_at is null and is_available = true;

  v_product_count := coalesce(array_length(v_product_ids, 1), 0);
  if v_product_count = 0 then
    raise exception 'Tidak ada produk tersedia — jalankan supabase/seed.sql (katalog) dulu.';
  end if;

  for v_i in 1 .. v_count loop
    v_tipe   := case when v_i % 3 = 0 then 'dine_in' else 'takeaway' end;
    v_meja   := case when v_tipe = 'dine_in' then (1 + (v_i % 8))::text else null end;
    v_metode := case when v_i % 2 = 0 then 'qris' else 'cash' end;

    -- bias payment: mostly paid once "done", mostly unpaid before that, but mixed
    v_bayar := case
      when v_status[v_i] = 'done' and v_i % 4 <> 0 then 'paid'
      when v_status[v_i] <> 'done' and v_i % 5 = 0 then 'paid'
      else 'unpaid'
    end;

    insert into public.pesanan (
      nama_pelanggan, tipe_pesanan, nomor_meja, metode_pembayaran,
      status_pembayaran, status_pesanan, total_harga, waktu_pesanan
    ) values (
      'Test ' || v_customer_names[1 + (v_i % array_length(v_customer_names, 1))],
      v_tipe, v_meja, v_metode, v_bayar, v_status[v_i], 0,
      now() - ((v_count - v_i) || ' minutes')::interval
    )
    returning id_pesanan into v_id_pesanan;

    v_n_items := 1 + (v_i % 3); -- 1..3 line items per order
    v_total := 0;
    for v_j in 1 .. v_n_items loop
      v_pid := v_product_ids[1 + ((v_i * 3 + v_j) % v_product_count)];
      select harga into v_harga from public.produk where id_produk = v_pid;
      v_qty := 1 + ((v_i + v_j) % 3);

      insert into public.detail_pesanan (id_pesanan, id_produk, kuantitas, harga_satuan, subtotal)
      values (v_id_pesanan, v_pid, v_qty, v_harga, v_harga * v_qty);

      v_total := v_total + v_harga * v_qty;
    end loop;

    update public.pesanan set total_harga = v_total where id_pesanan = v_id_pesanan;
  end loop;
end $$;
