"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { MidoriLogo } from "@/components/brand/MidoriLogo";
import { signOutAdmin } from "@/services/supabase/auth-actions";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Order Queue" },
  { href: "/admin/products", label: "Produk & Kategori" },
  { href: "/admin/reports", label: "Laporan / Close Order" },
];

const SIDEBAR_KEY = "midori-admin-sidebar";

export interface AdminShellProps {
  children: ReactNode;
  /** Shown in the header bar and page context. */
  adminEmail?: string;
}

/** Desktop dashboard shell: collapsible sidebar + scrollable content. */
export function AdminShell({ children, adminEmail }: AdminShellProps) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) !== "0";
    } catch {
      return true;
    }
  });

  const toggleSidebar = () => {
    setSidebarOpen((open) => {
      const next = !open;
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="bg-background flex min-h-dvh">
      <aside
        className={cn(
          "border-border bg-surface sticky top-0 h-dvh w-60 shrink-0 flex-col self-start overflow-y-auto border-r p-4",
          sidebarOpen ? "hidden md:flex" : "hidden",
        )}
      >
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-pressed={sidebarOpen}
              title={sidebarOpen ? "Sembunyikan menu" : "Tampilkan menu"}
              className="border-border text-ink-700 hover:bg-cream-100 hidden h-9 w-9 items-center justify-center rounded-md border text-base md:inline-flex"
            >
              <span aria-hidden>☰</span>
              <span className="sr-only">
                {sidebarOpen ? "Sembunyikan menu" : "Tampilkan menu"}
              </span>
            </button>
            <span className="text-muted text-sm md:hidden">Midori Admin</span>
            <span className="text-muted hidden text-sm md:inline">
              {adminEmail}
            </span>
          </div>
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
