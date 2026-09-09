import Link from "next/link";

import { KioskShell } from "@/components/layout/KioskShell";
import { buttonClass } from "@/components/ui";

export default function KioskHomePage() {
  return (
    <KioskShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
        <div className="space-y-3">
          <p className="text-5xl" aria-hidden>
            茶
          </p>
          <h1 className="text-4xl font-bold">Selamat datang di Midori</h1>
          <p className="text-muted text-lg">
            Pesan sendiri langsung dari layar ini — cepat dan mudah.
          </p>
        </div>
        <Link href="/kiosk/menu" className={buttonClass({ size: "lg" })}>
          Mulai Pesan
        </Link>
      </div>
    </KioskShell>
  );
}
