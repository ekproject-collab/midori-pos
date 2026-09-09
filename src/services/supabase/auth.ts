import { cache } from "react";

import { env } from "@/lib/env";

import { getSupabaseServerClient } from "./server";

export interface AdminUser {
  id: string;
  email: string;
}

/**
 * The authenticated admin for the current request, or null.
 *
 * Memoised per render pass with React `cache()` so the layout, pages and any
 * server action can all call it without extra round-trips. Enforces the
 * optional `ADMIN_EMAIL` allowlist (PRD 1.1 — single admin).
 */
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  if (
    env.adminEmail &&
    user.email.toLowerCase() !== env.adminEmail.toLowerCase()
  ) {
    return null;
  }

  return { id: user.id, email: user.email };
});
