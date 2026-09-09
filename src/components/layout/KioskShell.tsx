import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface KioskShellProps {
  children: ReactNode;
  /** Sticky footer area, e.g. the cart bar. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Full-viewport shell for the customer kiosk. Optimised for a landscape tablet
 * at the counter: large type, generous spacing, no page-level horizontal scroll.
 */
export function KioskShell({ children, footer, className }: KioskShellProps) {
  return (
    <div className="kiosk-root bg-background flex min-h-dvh flex-col">
      <header className="border-border bg-surface flex items-center gap-3 border-b px-6 py-4">
        <span className="text-2xl leading-none" aria-hidden>
          茶
        </span>
        <span className="text-lg font-bold tracking-tight">
          Midori{" "}
          <span className="text-muted font-normal">Matcha &amp; More</span>
        </span>
      </header>

      <main className={cn("mx-auto w-full max-w-5xl flex-1 p-6", className)}>
        {children}
      </main>

      {footer && (
        <footer className="border-border bg-surface sticky bottom-0 border-t px-6 py-4">
          <div className="mx-auto w-full max-w-5xl">{footer}</div>
        </footer>
      )}
    </div>
  );
}
