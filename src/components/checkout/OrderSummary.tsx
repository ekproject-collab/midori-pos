"use client";

import { useCart } from "@/components/cart/CartProvider";
import { selectLineSubtotal } from "@/lib/cart/reducer";
import { formatRupiah } from "@/lib/format";

/** Read-only recap of the cart shown alongside the checkout form. */
export function OrderSummary() {
  const { items, subtotal } = useCart();

  return (
    <aside className="border-border bg-surface h-fit rounded-md border p-5">
      <h2 className="mb-4 text-lg font-semibold">Ringkasan Pesanan</h2>
      <ul className="space-y-3 text-base">
        {items.map((item) => (
          <li key={item.id_produk} className="flex justify-between gap-2">
            <span className="min-w-0">
              <span className="tabular-nums">{item.kuantitas}×</span>{" "}
              {item.nama_produk}
            </span>
            <span className="shrink-0 tabular-nums">
              {formatRupiah(selectLineSubtotal(item))}
            </span>
          </li>
        ))}
      </ul>
      <div className="border-border mt-4 flex justify-between border-t pt-4 text-lg font-bold">
        <span>Total</span>
        <span className="tabular-nums">{formatRupiah(subtotal)}</span>
      </div>
    </aside>
  );
}
