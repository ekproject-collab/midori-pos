import Link from "next/link";

import { CartBar } from "@/components/cart/CartBar";
import { MenuBrowser } from "@/components/kiosk/MenuBrowser";
import { KioskShell } from "@/components/layout/KioskShell";

export default function KioskMenuPage() {
  return (
    <KioskShell footer={<CartBar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Menu</h1>
          <Link href="/kiosk" className="text-muted text-base underline">
            ← Beranda
          </Link>
        </div>
        <MenuBrowser />
      </div>
    </KioskShell>
  );
}
