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
| `seed.sql` | Dev catalog data (3 categories, 10 products). Re-runnable. Does not touch orders. |
| `_apply_all.generated.sql` | All migrations concatenated — for the one-paste path below. Regenerate with `npm run db:build`. |

## Applying it

### Option A — SQL Editor (fastest, no tooling)

1. Supabase Dashboard → **SQL Editor** → New query.
2. Paste all of `_apply_all.generated.sql`, run.
3. New query → paste `seed.sql`, run (dev only).

### Option B — Supabase CLI (recommended once set up)

```bash
# one-time
npm i -g supabase        # or: scoop install supabase / brew install supabase
supabase login
supabase link --project-ref ksszwyejkqhmvsszhiqz

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
supabase gen types typescript --project-id ksszwyejkqhmvsszhiqz > src/types/database.ts
```

Until the CLI is set up, `src/types/database.ts` is maintained by hand to match
these migrations.
