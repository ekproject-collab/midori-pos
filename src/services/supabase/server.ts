import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Per-request Supabase client for Server Components, Route Handlers and Server
 * Actions. Never cache or share this across requests — call it fresh each time.
 *
 * `setAll` is a no-op when called from a Server Component (cookies are
 * read-only there); the proxy handles session refresh in that case.
 */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component context — safe to ignore.
        }
      },
    },
  });
}
