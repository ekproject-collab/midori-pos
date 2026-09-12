import type { ReactNode } from "react";

import { MidoriLogo } from "@/components/brand/MidoriLogo";
import { cn } from "@/lib/cn";

export interface KioskShellProps {
  children: ReactNode;
  /**
   * Sticky footer area, e.g. the cart bar. Rendered raw (no chrome) so a
   * component that returns `null` when idle leaves no empty bar behind.
   */
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
      <header className="border-border bg-surface flex items-center gap-3 border-b px-6 py-3">
        <MidoriLogo size={44} priority />
      </header>

      <main className={cn("mx-auto w-full max-w-5xl flex-1 p-6", className)}>
        {children}
      </main>

      {footer}
    </div>
  );
}
