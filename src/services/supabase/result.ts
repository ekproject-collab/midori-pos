import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Uniform return shape for every service function.
 * Callers branch on `error` (a human-readable string) — they never see raw
 * PostgrestError objects or thrown exceptions. This keeps the kiosk resilient
 * (AGENTS.md Section 3): a failed query degrades gracefully instead of crashing.
 */
export type Result<T> =
  { data: T; error: null } | { data: null; error: string };

export function ok<T>(data: T): Result<T> {
  return { data, error: null };
}

export function fail<T = never>(error: string): Result<T> {
  return { data: null, error };
}

/** Map a Supabase/Postgres error to a message safe to surface in the UI. */
export function messageFromPostgrestError(error: PostgrestError): string {
  // RAISE EXCEPTION messages from our RPCs are already user-facing Indonesian.
  if (error.message) return error.message;
  if (error.details) return error.details;
  return "Terjadi kesalahan pada server.";
}

/**
 * Run a Supabase query builder and normalise the outcome to a `Result`.
 * Wraps unexpected throws (network failures, etc.) too.
 */
export async function runQuery<T>(
  query: PromiseLike<{ data: T | null; error: PostgrestError | null }>,
): Promise<Result<T>> {
  try {
    const { data, error } = await query;
    if (error) return fail(messageFromPostgrestError(error));
    if (data === null) return fail("Data tidak ditemukan.");
    return ok(data);
  } catch (err) {
    return fail(
      err instanceof Error ? err.message : "Gagal menghubungi server.",
    );
  }
}
