"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderConfirmation } from "@/components/checkout/OrderConfirmation";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { KioskShell } from "@/components/layout/KioskShell";
import { useToast } from "@/components/ui";
import type { CartItem } from "@/lib/cart/types";
import type { CheckoutValues } from "@/lib/checkout/validate";
import { createOrder } from "@/services/supabase";
import type { Pesanan } from "@/types";

interface Confirmed {
  order: Pesanan;
  items: CartItem[];
}

export default function KioskCheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { items, clear } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  // Empty cart and not yet confirmed — nothing to check out.
  useEffect(() => {
    if (!confirmed && items.length === 0) router.replace("/kiosk/menu");
  }, [confirmed, items.length, router]);

  if (confirmed) {
    return (
      <KioskShell>
        <OrderConfirmation
          order={confirmed.order}
          items={confirmed.items}
          onOrderAgain={() => router.push("/kiosk")}
        />
      </KioskShell>
    );
  }

  if (items.length === 0) return null;

  const handleSubmit = async (values: CheckoutValues) => {
    setSubmitting(true);
    const snapshot = items.slice();

    const result = await createOrder({
      namaPelanggan: values.nama,
      tipePesanan: values.tipe,
      nomorMeja: values.tipe === "dine_in" ? values.nomorMeja : null,
      metodePembayaran: values.metode,
      items: snapshot.map((i) => ({
        id_produk: i.id_produk,
        kuantitas: i.kuantitas,
      })),
    });

    if (result.error !== null) {
      // Cart is left untouched so the customer can retry.
      toast.show(result.error, "danger");
      setSubmitting(false);
      return;
    }

    setConfirmed({ order: result.data, items: snapshot });
    clear();
  };

  return (
    <KioskShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <Link href="/kiosk/cart" className="text-muted text-base underline">
            ← Keranjang
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="border-border bg-surface rounded-md border p-6">
            <CheckoutForm onSubmit={handleSubmit} submitting={submitting} />
          </div>
          <OrderSummary />
        </div>
      </div>
    </KioskShell>
  );
}
