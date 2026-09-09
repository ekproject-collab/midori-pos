import Link from "next/link";

import { MenuBrowser } from "@/components/kiosk/MenuBrowser";
import { KioskShell } from "@/components/layout/KioskShell";

export default function KioskMenuPage() {
  return (
    <KioskShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Menu</h1>
          <Link href="/kiosk" className="text-muted text-sm underline">
            ← Beranda
          </Link>
        </div>
        <MenuBrowser />
      </div>
    </KioskShell>
  );
}
