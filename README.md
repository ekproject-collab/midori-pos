# Midori POS — Matcha & Coffee Kiosk

Self-ordering kiosk POS for a matcha & coffee shop, with a single-admin dashboard.

- **Product spec:** [PRD.md](PRD.md)
- **Build plan (phased):** [PLAN.md](PLAN.md)
- **Coding & UI rules:** [AGENTS.md](AGENTS.md)

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL, Auth, Storage, Realtime)
- Deployed on Vercel

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in Supabase URL + anon key
npm run dev
```

Open http://localhost:3000 — `/kiosk` for the customer UI, `/admin` for the dashboard.

## Environment variables

| Variable | Where to find it |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |

Set the same variables in the Vercel project settings for deployment.

## Project structure

```
src/
  app/
    kiosk/        Public self-ordering UI
    admin/        Protected dashboard (auth added in Phase 6)
  components/     Presentational React components
    ui/           Reusable design-system primitives (Phase 2)
  hooks/          Custom data hooks
  lib/            Framework-agnostic helpers (env, cart logic, …)
  services/
    supabase/     The ONLY place that talks to Supabase (per AGENTS.md)
  types/          Shared TypeScript types
```

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
