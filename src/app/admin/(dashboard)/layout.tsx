import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/layout/AdminShell";
import { getAdminUser } from "@/services/supabase/auth";

/**
 * Server-side auth gate for every dashboard route. Defense in depth on top of
 * the proxy: this runs in the app runtime and enforces the ADMIN_EMAIL
 * allowlist. `/admin/login` sits outside this group so there is no redirect
 * loop.
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");

  return <AdminShell adminEmail={admin.email}>{children}</AdminShell>;
}
