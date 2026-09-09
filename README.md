# Midori POS — Matcha & Coffee Kiosk

Self-ordering kiosk POS for a matcha & coffee shop, with a single-admin dashboard.

- **Product spec:** [PRD.md](PRD.md)
- **Build plan (phased):** [PLAN.md](PLAN.md)
- **Coding & UI rules:** [AGENTS.md](AGENTS.md)
- **Owner's guide (Bahasa Indonesia):** [docs/OWNER.md](docs/OWNER.md)
- **Database:** [supabase/README.md](supabase/README.md)

## Features

- **Kiosk** (`/kiosk`) — browse the menu by category, cart with quantities,
  checkout (name, dine-in/takeaway + table, cash/QRIS), digital receipt with a
  queue number. Prices are re-computed server-side; orders are flood-limited.
- **Admin** (`/admin`) — single-admin login; live order queue (Supabase
  Realtime) with status + payment controls; product & category CRUD with image
  upload; daily recap + "Tutup Buku" (close order) with history and CSV export.

## Tech stack

- Next.js 16 (App Router) + TypeScript, Tailwind CSS v4
- Supabase — PostgreSQL, Auth, Storage, Realtime
- Deploys to Vercel (target cost: free tier)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the Supabase values
# apply supabase/_apply_all.generated.sql + supabase/seed.sql in the SQL Editor
npm run dev
```

Open http://localhost:3000 — `/kiosk` for customers, `/admin` for the owner.

## Environment variables

| Variable | Notes |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `ADMIN_EMAIL` | Optional, server-only. Restricts `/admin` to one email. |

## Deploying (Vercel)

1. Push the repo to GitHub.
2. Vercel → **New Project** → import the repo.
3. Add the three env vars above (Production + Preview).
4. Deploy. The build command is `next build` (default).
5. In Supabase → **Authentication → Providers → Email**, turn **off**
   "Allow new users to sign up" (single admin), and create the admin user under
   **Authentication → Users → Add user** (Auto Confirm).
6. Optional: add a custom domain in Vercel.

The app sends `X-Robots-Tag: noindex` and a disallow-all `robots.txt`, so the
deployment URL will not show up in search engines.

## Database

All schema lives in `supabase/migrations/`. Apply everything by pasting
`supabase/_apply_all.generated.sql` into the Supabase SQL Editor, then
`supabase/seed.sql` for the catalog. Regenerate the combined file with
`npm run db:build`. See [supabase/README.md](supabase/README.md) for the CLI
route and the access model.

### Order flood protection

`create_order` caps a single client IP at **30 orders / 5 minutes**. All orders
from the shop's own tablet share one IP, so raise `V_LIMIT` / `V_WINDOW` in
`supabase/migrations/20260909120600_rate_limit_orders.sql` for a busier counter.
Payment is always cashier-verified, so spam orders never become revenue.

## Project structure

```
src/
  app/
    kiosk/        Public self-ordering UI (+ error boundary)
    admin/
      login/          Public login page
      (dashboard)/    Auth-gated route group (layout re-verifies server-side)
  components/
    ui/           Design-system primitives (flat, no gradients/glassmorphism)
    layout/       KioskShell, AdminShell
    kiosk/ cart/ checkout/ admin/
  hooks/          Data hooks (useCatalog, useOrderQueue, useAdminCatalog, useReports)
  lib/            Framework-agnostic helpers (cart & checkout logic, format, env)
  services/supabase/  The ONLY place that talks to Supabase (per AGENTS.md)
  types/          Shared TypeScript types
  proxy.ts        Next 16 middleware — admin auth gate
```

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (cart + checkout logic) |
| `npm run format` | Prettier write |
| `npm run db:build` | Regenerate `supabase/_apply_all.generated.sql` |
| `npm run db:verify` | Check the DB against the Phase 1 acceptance tests |
