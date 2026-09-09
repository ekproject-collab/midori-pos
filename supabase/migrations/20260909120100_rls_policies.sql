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
