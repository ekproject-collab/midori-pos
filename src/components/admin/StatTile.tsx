import Link from "next/link";

import { cn } from "@/lib/cn";

export interface StatTileProps {
  label: string;
  value: string;
  accent?: boolean;
  href?: string;
}

export function StatTile({ label, value, accent, href }: StatTileProps) {
  const inner = (
    <>
      <p className="text-muted text-xs font-semibold tracking-wide uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
          accent && "text-matcha-800",
        )}
      >
        {value}
      </p>
    </>
  );

  const base = "block rounded-md border border-border bg-surface p-4";

  return href ? (
    <Link
      href={href}
      className={cn(base, "hover:bg-cream-100 transition-colors")}
    >
      {inner}
    </Link>
  ) : (
    <div className={base}>{inner}</div>
  );
}
