import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Single shared Supabase client for the browser / client components.
 *
 * Per AGENTS.md, this module is the only place that constructs a browser
 * Supabase connection. Feature code goes through the service functions in
 * `src/services/supabase/*`, never `createBrowserClient` directly.
 *
 * `@supabase/ssr` keeps the auth session in cookies so the proxy and server
 * components can read it. Created lazily + memoised so importing a service
 * does not require env vars at build time — only at first use.
 */
export type TypedSupabaseClient = SupabaseClient<Database>;

let cached: TypedSupabaseClient | null = null;

export function getSupabaseClient(): TypedSupabaseClient {
  if (!cached) {
    cached = createBrowserClient<Database>(
      env.supabaseUrl,
      env.supabaseAnonKey,
    );
  }
  return cached;
}
