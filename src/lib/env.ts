/**
 * Centralised, validated access to environment variables.
 *
 * Values are read lazily (via getters) so a missing variable fails at the
 * point of use with a clear message, rather than crashing the build or every
 * import. This keeps `next build` working before `.env.local` is filled in.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `Missing environment variable: ${name}. ` +
        `Copy .env.example to .env.local and fill in the Supabase values.`,
    );
  }
  return value;
}

export const env = {
  get supabaseUrl(): string {
    return required(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    );
  },
  get supabaseAnonKey(): string {
    return required(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  },
};

/** True when both Supabase variables are present (no throw). */
export function hasSupabaseEnv(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
