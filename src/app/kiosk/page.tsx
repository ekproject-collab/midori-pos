import Link from "next/link";

import { KioskShell } from "@/components/layout/KioskShell";
import { SupabaseStatus } from "@/components/SupabaseStatus";
import { Button } from "@/components/ui";

export default function KioskHomePage() {
  return (
    <KioskShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Selamat datang di Midori</h1>
          <p className="text-muted">
            Pesan sendiri, cepat dan mudah. Fase 3 akan mengisi alur menu.
          </p>
        </div>
        <Button size="lg" disabled>
          Mulai Pesan
        </Button>
        <SupabaseStatus />
        <Link href="/" className="text-muted text-sm underline">
          ← Kembali
        </Link>
      </div>
    </KioskShell>
  );
}
