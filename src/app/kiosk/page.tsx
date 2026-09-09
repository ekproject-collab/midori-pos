import Link from "next/link";

import { SupabaseStatus } from "@/components/SupabaseStatus";

export default function KioskHomePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">Kiosk</h1>
      <p className="text-stone-600">
        Placeholder — alur pemesanan mandiri dibangun di Fase 3–5 (lihat
        PLAN.md).
      </p>
      <SupabaseStatus />
      <Link href="/" className="text-sm text-stone-600 underline">
        ← Kembali
      </Link>
    </main>
  );
}
