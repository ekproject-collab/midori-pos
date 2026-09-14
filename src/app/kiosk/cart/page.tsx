import Link from "next/link";

import { CartView } from "@/components/cart/CartView";
import { KioskShell } from "@/components/layout/KioskShell";

export default function KioskCartPage() {
  return (
    <KioskShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Keranjang</h1>
          <Link href="/kiosk/menu" className="text-muted text-base underline">
            ← Menu
          </Link>
        </div>
        <CartView />
      </div>
    </KioskShell>
  );
}
