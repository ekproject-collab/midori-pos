import Link from "next/link";

export default function RootPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col justify-center gap-8 p-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Midori POS</h1>
        <p className="text-stone-600">
          Sistem POS kiosk self-ordering untuk kedai matcha &amp; coffee. Fase 0
          — fondasi project.
        </p>
      </header>

      <nav className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/kiosk"
          className="border border-stone-300 bg-white p-5 transition-colors hover:border-stone-900"
        >
          <span className="block text-lg font-semibold">Kiosk</span>
          <span className="text-sm text-stone-600">
            Antarmuka pemesanan mandiri (tablet)
          </span>
        </Link>
        <Link
          href="/admin"
          className="border border-stone-300 bg-white p-5 transition-colors hover:border-stone-900"
        >
          <span className="block text-lg font-semibold">Admin</span>
          <span className="text-sm text-stone-600">
            Dashboard pemilik (desktop)
          </span>
        </Link>
      </nav>
    </main>
  );
}
