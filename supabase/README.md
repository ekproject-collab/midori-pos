# Database (Supabase)

Schema, RLS policies, and RPC functions for Midori POS. Table/column names
follow [../PRD.md](../PRD.md) Section 3 verbatim.

## Files

| File | Purpose |
| :--- | :--- |
| `migrations/20260909120000_init_schema.sql` | 5 tables + constraints + indexes + `updated_at` trigger |
| `migrations/20260909120100_rls_policies.sql` | Row Level Security (anon reads catalog; authenticated = admin, full access) |
| `migrations/20260909120200_rpc_functions.sql` | `create_order`, `get_daily_sales`, `close_daily_recap` |
| `migrations/20260909120300_realtime.sql` | Adds `pesanan` to the `supabase_realtime` publication |
| `migrations/20260909120400_fix_function_grants.sql` | Revokes admin RPC EXECUTE from `anon` |
| `migrations/20260909120500_storage_produk_images.sql` | Public `produk-images` Storage bucket + policies (Phase 8 image uploads) |
| `migrations/20260909120600_rate_limit_orders.sql` | Per-IP flood protection inside `create_order` (30 orders / 5 min) |
| `migrations/20260913090000_unclosed_days.sql` | `get_unclosed_days()` — finds past days with orders but no `rekap_harian` row, so a missed "Tutup Buku" can be closed retroactively |
| `seed.sql` | Full Midori catalog (4 categories, 27 products). Re-runnable — wipes catalog + orders first. |
| `seed_orders.sql` | **Dev/test only.** 24 synthetic orders for today (8 new / 7 preparing / 9 done) — enough to exercise Order Queue pagination. Re-runnable — wipes `pesanan` first. Never run against real shop data. |
| `_apply_all.generated.sql` | All migrations concatenated — for the one-paste path below. Regenerate with `npm run db:build`. |

## Applying it

### Option A — SQL Editor (fastest, no tooling)

1. Supabase Dashboard → **SQL Editor** → New query.
2. Paste all of `_apply_all.generated.sql`, run.
3. New query → paste `seed.sql`, run (dev only).
4. Optional, dev only → new query → paste `seed_orders.sql`, run, to populate
   the Order Queue with test data (also handy for re-testing pagination).

### Option B — Supabase CLI (recommended once set up)

```bash
# one-time
npm i -g supabase        # or: scoop install supabase / brew install supabase
supabase login
supabase link --project-ref <your-project-ref>

# apply
supabase db push         # runs migrations/
psql "$(supabase db url)" -f supabase/seed.sql   # dev data
```

## Access model

- **anon (kiosk):** `SELECT` on `kategori` and non-deleted `produk` only.
  Orders are created via `create_order()` (SECURITY DEFINER) — there is no
  direct INSERT path, and prices come from the live catalog, not the client.
- **authenticated (the single admin):** full access to every table, plus
  `get_daily_sales()` and `close_daily_recap()`.

## Shop day

All day boundaries (`get_daily_sales`, `close_daily_recap`) use **Asia/Jakarta**.

## Regenerating types

After changing the schema, regenerate `src/types/database.ts`:

```bash
supabase gen types typescript --project-id <your-project-ref> > src/types/database.ts
```

Until the CLI is set up, `src/types/database.ts` is maintained by hand to match
these migrations.
