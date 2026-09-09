import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Tone = "neutral" | "matcha" | "success" | "warning" | "danger" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  neutral: "border-border bg-cream-100 text-ink-700",
  matcha: "border-matcha-300 bg-matcha-100 text-matcha-800",
  success: "border-success-700/30 bg-success-100 text-success-700",
  warning: "border-warning-700/30 bg-warning-100 text-warning-700",
  danger: "border-danger-700/30 bg-danger-100 text-danger-700",
  info: "border-info-700/30 bg-info-100 text-info-700",
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-semibold tracking-wide uppercase",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
