"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-4xl" aria-hidden>
        🍵
      </p>
      <h1 className="text-2xl font-bold">Terjadi kesalahan</h1>
      <p className="text-muted max-w-sm">
        Silakan coba lagi. Jika masih bermasalah, hubungi admin.
      </p>
      <Button size="lg" onClick={reset}>
        Coba lagi
      </Button>
    </main>
  );
}
