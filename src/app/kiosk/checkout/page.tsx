"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { KioskShell } from "@/components/layout/KioskShell";
import { useToast } from "@/components/ui";
import type { CheckoutValues } from "@/lib/checkout/validate";

export default function KioskCheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { items } = useCart();

  // Nothing to check out — send them back to the menu.
  useEffect(() => {
    if (items.length === 0) router.replace("/kiosk/menu");
  }, [items.length, router]);

  if (items.length === 0) return null;

  const handleSubmit = (values: CheckoutValues) => {
    // Phase 5 wires this to the create_order RPC + the receipt screen.
    console.info("checkout submit (Phase 5 TODO):", values);
    toast.show("Form valid. Pengiriman pesanan menyusul di Fase 5.", "info");
  };

  return (
    <KioskShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <Link href="/kiosk/cart" className="text-muted text-sm underline">
            ← Keranjang
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="border-border bg-surface rounded-md border p-4">
            <CheckoutForm onSubmit={handleSubmit} />
          </div>
          <OrderSummary />
        </div>
      </div>
    </KioskShell>
  );
}
