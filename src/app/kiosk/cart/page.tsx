import Link from "next/link";

import { CartView } from "@/components/cart/CartView";
import { KioskShell } from "@/components/layout/KioskShell";

export default function KioskCartPage() {
  return (
    <KioskShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Keranjang</h1>
          <Link href="/kiosk/menu" className="text-muted text-sm underline">
            ← Menu
          </Link>
        </div>
        <CartView />
      </div>
    </KioskShell>
  );
}
