"use client";

import { useEffect, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

/**
 * Solid-overlay dialog. No backdrop-blur / translucency (AGENTS.md Section 1):
 * the scrim is a flat semi-opaque ink wash, the panel is opaque.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        className="bg-ink-900/60 absolute inset-0"
        aria-label="Tutup"
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        className={cn(
          "border-ink-900 bg-surface shadow-hard relative w-full rounded-md border",
          sizes[size],
        )}
      >
        {title && (
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-ink-900"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
        {footer && (
          <div className="border-border flex justify-end gap-2 border-t px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
