-- =============================================================================
-- Midori POS — Phase 1: enable Realtime on pesanan
-- The admin Order Queue (Phase 7) subscribes to live inserts/updates.
-- =============================================================================

alter publication supabase_realtime add table public.pesanan;
