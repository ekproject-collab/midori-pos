"use client";

import { useEffect } from "react";

import { KioskShell } from "@/components/layout/KioskShell";
import { Button } from "@/components/ui";

/**
 * Segment-level safety net — the kiosk must never show a raw crash screen to a
 * customer at the counter (AGENTS.md Section 3).
 */
export default function KioskError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Kiosk error:", error);
  }, [error]);

  return (
    <KioskShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-4xl" aria-hidden>
          🍵
        </p>
        <h1 className="text-2xl font-bold">Ada gangguan sebentar</h1>
        <p className="text-muted max-w-sm">
          Silakan coba lagi. Jika masih bermasalah, mohon panggil kasir.
        </p>
        <Button size="lg" onClick={reset}>
          Coba lagi
        </Button>
      </div>
    </KioskShell>
  );
}
