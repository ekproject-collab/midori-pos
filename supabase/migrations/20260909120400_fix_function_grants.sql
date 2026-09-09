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
