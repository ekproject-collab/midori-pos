-- =============================================================================
-- Midori POS — Phase 9 fix: recover a missed "Tutup Buku"
--
-- If the admin doesn't close the current day before the Asia/Jakarta date
-- rolls over, the "Rekap Hari Ini" card silently starts showing the NEW day
-- and the old day has no rekap_harian row yet. The order data was never at
-- risk (pesanan is never auto-deleted) — but until now there was no way in
-- the app to close a past day. close_daily_recap() already accepts an
-- explicit p_tanggal; this adds a way to discover which past days still need
-- it.
-- =============================================================================

create or replace function public.get_unclosed_days()
returns table (
  tanggal         date,
  total_transaksi bigint
)
language sql
security invoker
set search_path = public
as $$
  select
    (p.waktu_pesanan at time zone 'Asia/Jakarta')::date as tanggal,
    count(*) as total_transaksi
  from public.pesanan p
  where (p.waktu_pesanan at time zone 'Asia/Jakarta')::date
        < (now() at time zone 'Asia/Jakarta')::date
    and not exists (
      select 1
      from public.rekap_harian r
      where r.tanggal = (p.waktu_pesanan at time zone 'Asia/Jakarta')::date
    )
  group by 1
  order by 1;
$$;

revoke all on function public.get_unclosed_days() from public, anon;
grant execute on function public.get_unclosed_days() to authenticated;
