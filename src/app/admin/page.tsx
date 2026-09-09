import Link from "next/link";

import { SupabaseStatus } from "@/components/SupabaseStatus";

export default function AdminHomePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="text-stone-600">
        Placeholder — autentikasi &amp; dashboard dibangun di Fase 6–9 (lihat
        PLAN.md). Route ini belum diproteksi.
      </p>
      <SupabaseStatus />
      <Link href="/" className="text-sm text-stone-600 underline">
        ← Kembali
      </Link>
    </main>
  );
}
