"use client";

import Link from "next/link";

import { buttonClass } from "@/components/ui";
import { formatRupiah } from "@/lib/format";

import { useCart } from "./CartProvider";

/** Sticky summary bar shown on the menu while the cart has items. */
export function CartBar() {
  const { itemCount, subtotal } = useCart();

  if (itemCount === 0) return null;

  return (
    <footer className="border-border bg-surface sticky bottom-0 border-t px-6 py-4">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
        <div className="text-sm">
          <span className="font-semibold">{itemCount} item</span>
          <span className="text-muted mx-2">·</span>
          <span className="font-bold tabular-nums">
            {formatRupiah(subtotal)}
          </span>
        </div>
        <Link href="/kiosk/cart" className={buttonClass({ size: "lg" })}>
          Lihat Keranjang
        </Link>
      </div>
    </footer>
  );
}
