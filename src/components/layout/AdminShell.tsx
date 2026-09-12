"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { MidoriLogo } from "@/components/brand/MidoriLogo";
import { signOutAdmin } from "@/services/supabase/auth-actions";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Order Queue" },
  { href: "/admin/products", label: "Produk & Kategori" },
  { href: "/admin/reports", label: "Laporan / Close Order" },
];

export interface AdminShellProps {
  children: ReactNode;
  /** Shown in the header bar and page context. */
  adminEmail?: string;
}

/** Desktop dashboard shell: fixed sidebar + scrollable content. */
export function AdminShell({ children, adminEmail }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="bg-background flex min-h-dvh">
      <aside className="border-border bg-surface sticky top-0 hidden h-dvh w-60 shrink-0 flex-col self-start overflow-y-auto border-r p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <MidoriLogo size={32} />
          <span className="font-bold">Admin</span>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium",
                  active
                    ? "bg-matcha-100 text-matcha-800"
                    : "text-ink-700 hover:bg-cream-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border bg-surface sticky top-0 z-20 flex items-center justify-between gap-3 border-b px-6 py-3">
          <span className="text-muted text-sm md:hidden">Midori Admin</span>
          <span className="text-muted hidden text-sm md:inline">
            {adminEmail}
          </span>
          <form action={signOutAdmin}>
            <button
              type="submit"
              className="border-border text-ink-700 hover:bg-cream-100 rounded-md border px-3 py-1.5 text-sm font-semibold"
            >
              Keluar
            </button>
          </form>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
