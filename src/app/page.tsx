import Link from "next/link";

import { MidoriLogo } from "@/components/brand/MidoriLogo";
import { Card } from "@/components/ui";

export default function RootPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col justify-center gap-8 p-8">
      <header className="space-y-2">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <MidoriLogo size={40} /> Midori POS
        </h1>
        <p className="text-muted">
          Sistem POS kiosk self-ordering untuk kedai matcha &amp; coffee.
        </p>
      </header>

      <nav className="grid gap-3 sm:grid-cols-2">
        <Link href="/kiosk">
          <Card raised className="hover:bg-cream-100 p-5 transition-colors">
            <span className="block text-lg font-semibold">Kiosk</span>
            <span className="text-muted text-sm">
              Antarmuka pemesanan mandiri (tablet)
            </span>
          </Card>
        </Link>
        <Link href="/admin">
          <Card raised className="hover:bg-cream-100 p-5 transition-colors">
            <span className="block text-lg font-semibold">Admin</span>
            <span className="text-muted text-sm">
              Dashboard pemilik (desktop)
            </span>
          </Card>
        </Link>
      </nav>

      <p className="text-muted text-xs">
        <Link href="/style-guide" className="underline">
          Style guide
        </Link>
      </p>
    </main>
  );
}
