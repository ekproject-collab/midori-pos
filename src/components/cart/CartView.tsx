"use client";

import Link from "next/link";

import { ProductImage } from "@/components/kiosk/ProductImage";
import {
  buttonClass,
  Button,
  EmptyState,
  QuantityStepper,
} from "@/components/ui";
import { selectLineSubtotal } from "@/lib/cart/reducer";
import { formatRupiah } from "@/lib/format";

import { useCart } from "./CartProvider";

export function CartView() {
  const { items, subtotal, setQuantity, remove, clear } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Keranjang masih kosong"
        description="Tambahkan menu favoritmu dulu."
        icon="🛒"
        action={
          <Link href="/kiosk/menu" className={buttonClass()}>
            Lihat Menu
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <ul className="divide-border border-border bg-surface divide-y rounded-md border">
        {items.map((item) => (
          <li key={item.id_produk} className="flex gap-3 p-3">
            <div className="border-border relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border">
              <ProductImage src={item.gambar_url} alt={item.nama_produk} />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="leading-tight font-semibold">{item.nama_produk}</p>
              <p className="text-muted text-xs tabular-nums">
                {formatRupiah(item.harga)} / item
              </p>
              <div className="mt-1 flex items-center gap-3">
                <QuantityStepper
                  value={item.kuantitas}
                  min={0}
                  onChange={(next) => setQuantity(item.id_produk, next)}
                  aria-label={`Kuantitas ${item.nama_produk}`}
                />
                <button
                  type="button"
                  onClick={() => remove(item.id_produk)}
                  className="text-danger-700 text-xs underline"
                >
                  Hapus
                </button>
              </div>
            </div>

            <div className="shrink-0 self-end font-bold tabular-nums">
              {formatRupiah(selectLineSubtotal(item))}
            </div>
          </li>
        ))}
      </ul>

      <div className="border-border flex items-center justify-between border-t pt-3 text-lg">
        <span className="font-semibold">Total</span>
        <span className="font-bold tabular-nums">{formatRupiah(subtotal)}</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row-reverse sm:items-center sm:justify-between">
        <Link
          href="/kiosk/checkout"
          className={buttonClass({
            size: "lg",
            block: true,
            className: "sm:w-auto",
          })}
        >
          Lanjut ke Checkout
        </Link>
        <div className="flex gap-3">
          <Link href="/kiosk/menu" className="text-muted text-sm underline">
            ← Tambah item lagi
          </Link>
          <Button variant="ghost" size="sm" onClick={clear}>
            Kosongkan
          </Button>
        </div>
      </div>
    </div>
  );
}
