import { hasSupabaseEnv } from "@/lib/env";

import { getSupabaseClient } from "./client";

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
