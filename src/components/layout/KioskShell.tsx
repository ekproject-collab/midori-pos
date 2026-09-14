import type { ReactNode } from "react";

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
 * No shared header — it ate into screen space on the kiosk touchscreen; each
 * page (e.g. the home hero) carries its own branding where it makes sense.
 */
export function KioskShell({ children, footer, className }: KioskShellProps) {
  return (
    <div
      className="kiosk-root bg-background flex min-h-dvh flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url(/kiosk-background.jpeg)" }}
    >
      <main className={cn("mx-auto w-full max-w-5xl flex-1 p-6", className)}>
        {children}
      </main>

      {footer}
    </div>
  );
}
