"use client";

import { cn } from "@/lib/cn";

export interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "md" | "lg";
  className?: string;
  "aria-label"?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  size = "md",
  className,
  "aria-label": ariaLabel = "Kuantitas",
}: QuantityStepperProps) {
  const btn = size === "lg" ? "h-12 w-12 text-xl" : "h-9 w-9 text-base";
  const box = size === "lg" ? "w-12 text-lg" : "w-9 text-sm";

  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)));

  return (
    <div
      className={cn(
        "border-border bg-surface inline-flex items-center rounded-md border",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className={cn(
          btn,
          "text-ink-700 hover:bg-cream-100 flex items-center justify-center font-bold disabled:opacity-40",
        )}
        onClick={() => set(value - 1)}
        disabled={value <= min}
        aria-label="Kurangi"
      >
        −
      </button>
      <span
        className={cn(
          box,
          "border-border border-x py-1 text-center font-semibold tabular-nums",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={cn(
          btn,
          "text-ink-700 hover:bg-cream-100 flex items-center justify-center font-bold disabled:opacity-40",
        )}
        onClick={() => set(value + 1)}
        disabled={value >= max}
        aria-label="Tambah"
      >
        +
      </button>
    </div>
  );
}
