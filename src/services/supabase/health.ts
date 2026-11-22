import { hasSupabaseEnv } from "@/lib/env";

import { getSupabaseClient } from "./client";
import { getSupabaseServerClient } from "./server";

export type HealthResult = { ok: true } | { ok: false; message: string };

/**
 * Lightweight connectivity check used by the Phase 0 placeholder pages.
 * Hits Supabase Auth (available before any table exists) to confirm the
 * URL + anon key are valid and reachable.
 */
export async function checkSupabaseConnection(): Promise<HealthResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      message: "Env belum diisi (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY).",
    };
  }
  try {
    const { error } = await getSupabaseClient().auth.getSession();
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Server-side DB health check for `GET /health` (Vercel Cron, UptimeRobot,
 * GitHub Actions keep-alive). Runs a lightweight `HEAD` query against the
 * `kategori` table so Supabase registers real Postgres activity and never
 * triggers its 7-day inactivity auto-pause.
 */
export async function pingSupabaseDatabase(): Promise<HealthResult> {
  if (!hasSupabaseEnv()) {
    return {
      ok: false,
      message: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }
  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("kategori")
      .select("id_kategori", { count: "exact", head: true })
      .limit(1);

    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
