import Link from "next/link";

import { MidoriLogo } from "@/components/brand/MidoriLogo";
import { KioskShell } from "@/components/layout/KioskShell";
import { buttonClass } from "@/components/ui";

export default function KioskHomePage() {
  return (
    <KioskShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
        <div className="space-y-4">
          <MidoriLogo size={168} className="mx-auto" priority />
          <h1 className="text-6xl font-bold">Selamat datang di Midori</h1>
          <p className="text-muted text-2xl">Silakan mulai pesanan.</p>
        </div>
        <Link href="/kiosk/menu" className={buttonClass({ size: "xl" })}>
          Mulai Pesan
        </Link>
      </div>
    </KioskShell>
  );
}
