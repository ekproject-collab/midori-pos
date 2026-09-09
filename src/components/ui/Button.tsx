import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "border-matcha-700 bg-matcha-600 text-white hover:bg-matcha-700",
  secondary: "border-border bg-surface text-ink-900 hover:bg-cream-100",
  ghost: "border-transparent bg-transparent text-ink-700 hover:bg-cream-100",
  danger: "border-danger-700 bg-danger-700 text-white hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

/** Shared class string — use for links that should look like a button. */
export function buttonClass(
  opts: {
    variant?: Variant;
    size?: Size;
    block?: boolean;
    className?: string;
  } = {},
) {
  const { variant = "primary", size = "md", block = false, className } = opts;
  return cn(base, variants[variant], sizes[size], block && "w-full", className);
}

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, block, className })}
      {...props}
    />
  );
}
