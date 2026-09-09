# Deploy Midori POS to a fresh GitHub + Supabase + Vercel

Follow this end-to-end to run the app under **your own** accounts. Nothing in
the code hardcodes a project — everything comes from 3 environment variables.

---

## 0. Prerequisites

- A GitHub account (the target one)
- A Supabase account
- A Vercel account (sign in with the target GitHub)
- `git` and Node 20+ locally

---

## 1. Put the code on the new GitHub account

On github.com (new account): **New repository** → e.g. `midori-pos` → *empty*
(no README/license).

Then locally:

```bash
cd "E:/Codebase/Midori POS"

# point origin at the new repo (replace URL)
git remote set-url origin https://github.com/<NEW_USER>/midori-pos.git
# or keep both: git remote add newremote https://github.com/<NEW_USER>/midori-pos.git

git push -u origin main
```

> If the old repo is private and you'd rather transfer it: GitHub → old repo →
> Settings → *Transfer ownership*. Otherwise the push above is simplest.

---

## 2. Create the new Supabase project

1. Supabase Dashboard → **New project**.
   - Region: pick the closest — **Southeast Asia (Singapore)** for Jakarta.
   - Set a strong database password (save it).
2. Wait for provisioning.
3. **Project Settings → API** — copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (a legacy `eyJ…` JWT or a new `sb_publishable_…` key — either works)

### 2a. Apply the schema

Supabase → **SQL Editor** → New query:

1. Paste the entire contents of `supabase/_apply_all.generated.sql` → **Run**.
   (7 migrations: tables, RLS, RPCs, realtime, grant fix, storage bucket, rate limit.)
2. New query → paste `supabase/seed.sql` → **Run** (the Midori catalog).

Quick check — new query:

```sql
select count(*) from produk;              -- 27
select id from storage.buckets where id = 'produk-images';  -- 1 row
select 1 from pg_publication_tables
 where pubname = 'supabase_realtime' and tablename = 'pesanan';  -- 1 row
```

### 2b. Create the admin user

Supabase → **Authentication → Users → Add user**
- email + password
- tick **Auto Confirm User**

### 2c. Lock down sign-ups

Supabase → **Authentication → Sign In / Providers → Email** → turn **off**
"Allow new users to sign up". (Single-admin — PRD 1.1.)

### 2d. (optional) point config.toml at the new project

`supabase/config.toml` → set `project_id` to the new ref (Settings → General).
Only matters if you use the Supabase CLI. Commit it.

---

## 3. Local `.env.local` (for local dev against the new project)

```
NEXT_PUBLIC_SUPABASE_URL=https://<new-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<new anon key>
ADMIN_EMAIL=<the admin email from 2b>
```

Then:

```bash
npm install
npm run build          # sanity check
npm run db:verify      # hits the new project with the anon key — expect 10/10
npm run dev            # http://localhost:3000
```

`.env.local` is gitignored — it never leaves your machine.

---

## 4. Deploy to Vercel

1. Vercel → **Add New… → Project** → import `midori-pos` from the new GitHub.
2. Framework preset: **Next.js** (auto). Build command / output: leave default.
3. **Environment Variables** — add all three for **Production** *and* **Preview**:
   | Name | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<new-ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<new anon key>` |
   | `ADMIN_EMAIL` | `<admin email>` |
4. **Deploy**.
5. (optional) **Settings → Domains** → add your custom domain.

> No extra Supabase config is needed for Vercel — the browser talks to Supabase
> directly and Supabase allows all origins for the anon key by default. If you
> later restrict origins in Supabase Auth settings, add the Vercel URL there.

---

## 5. Smoke test on the production URL

1. `https://<app>.vercel.app/kiosk` → place an order (try Dine-in + a table).
2. `https://<app>.vercel.app/admin` → log in as the admin.
3. The order appears in **Order Queue** within ~2s (chime).
4. Move it New → Preparing → Done; hit **Tandai Lunas**.
5. `/admin/products` → toggle a product to Sold Out → confirm it greys out on
   `/kiosk/menu`. Upload an image on a product → confirm it shows.
6. `/admin/reports` → figures match → **Tutup Buku Hari Ini** → appears in history.
7. Open `/kiosk` on the **actual counter tablet**, landscape, fullscreen — check
   readability and tap targets.

---

## 6. Go-live checklist

- [ ] `_apply_all.generated.sql` + `seed.sql` run on the new project
- [ ] Admin user created, sign-ups disabled
- [ ] 3 env vars set in Vercel (Production + Preview)
- [ ] Production smoke test passed (order → process → paid → close book)
- [ ] QRIS sticker at the counter
- [ ] Tablet opens `/kiosk` in fullscreen/kiosk mode
- [ ] Admin has `/admin` bookmarked on the cashier device
- [ ] Supabase → Database → **Backups** noted (free tier keeps recent daily backups)

---

## Notes

- **Old project cleanup:** once the new deployment is confirmed, you can pause
  or delete the old Supabase project and archive the old GitHub repo.
- **Rotating keys:** if the anon key ever leaks, rotate it in Supabase → API and
  update the Vercel env var + redeploy. The anon key is meant to be public-ish
  (RLS is the real guard), but rotate if in doubt.
- **Timezone:** all "today" logic is pinned to `Asia/Jakarta` in SQL, regardless
  of where Vercel/Supabase run.
