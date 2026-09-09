import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

/**
 * Single shared Supabase client for the browser / client components.
 *
 * Per AGENTS.md, this module is the only place that constructs a Supabase
 * connection. Feature code must go through the service functions in
 * `src/services/supabase/*`, never call `createClient` directly.
 *
 * The client is created lazily and memoised so that importing a service does
 * not require env vars to be present at build time — only at first use.
 *
 * Auth-aware server clients (cookie-bound) are added in the admin auth phase.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!cached) {
    cached = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return cached;
}
