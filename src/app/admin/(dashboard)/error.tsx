"use client";

import { useEffect } from "react";

import { Button, EmptyState } from "@/components/ui";

export default function DashboardError({
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
    <div className="p-6">
      <EmptyState
        title="Gagal memuat halaman"
        description="Coba muat ulang. Jika terus terjadi, cek koneksi atau login ulang."
        icon="⚠️"
        action={<Button onClick={reset}>Coba lagi</Button>}
      />
    </div>
  );
}
