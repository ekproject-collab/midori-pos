"use client";

import { Badge, Button } from "@/components/ui";
import type { CartItem } from "@/lib/cart/types";
import { selectLineSubtotal } from "@/lib/cart/reducer";
import { formatJakartaTime, formatRupiah } from "@/lib/format";
import type { Pesanan } from "@/types";

export interface OrderConfirmationProps {
  order: Pesanan;
  items: CartItem[];
  onOrderAgain: () => void;
}

export function OrderConfirmation({
  order,
  items,
  onOrderAgain,
}: OrderConfirmationProps) {
  const isQris = order.metode_pembayaran === "qris";

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="space-y-1 text-center">
        <p className="text-2xl">🍵</p>
        <h1 className="text-2xl font-bold">Pesanan diterima</h1>
        <p className="text-muted">
          Pesananmu sudah dikirim ke dapur. Tunjukkan nomor ini di kasir.
        </p>
      </div>

      {/* Queue number */}
      <div className="border-ink-900 bg-matcha-50 shadow-hard-sm rounded-md border p-6 text-center">
        <p className="text-muted text-xs font-semibold tracking-wide uppercase">
          Nomor Antrean
        </p>
        <p className="text-matcha-800 text-5xl font-bold tabular-nums">
          #{order.id_pesanan}
        </p>
      </div>

      {/* Order detail */}
      <div className="border-border bg-surface space-y-3 rounded-md border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-semibold">{order.nama_pelanggan}</span>
          <span className="text-muted">
            {formatJakartaTime(order.waktu_pesanan)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="info">
            {order.tipe_pesanan === "dine_in"
              ? `Dine-in · Meja ${order.nomor_meja}`
              : "Takeaway"}
          </Badge>
          <Badge tone="neutral">{isQris ? "QRIS" : "Cash"}</Badge>
          <Badge tone="warning">Belum dibayar</Badge>
        </div>

        <ul className="border-border space-y-1 border-t pt-3 text-sm">
          {items.map((item) => (
            <li key={item.id_produk} className="flex justify-between gap-2">
              <span>
                <span className="tabular-nums">{item.kuantitas}×</span>{" "}
                {item.nama_produk}
              </span>
              <span className="tabular-nums">
                {formatRupiah(selectLineSubtotal(item))}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-border flex justify-between border-t pt-3 font-bold">
          <span>Total</span>
          <span className="tabular-nums">
            {formatRupiah(order.total_harga)}
          </span>
        </div>
      </div>

      {/* Payment instructions */}
      <div className="border-border bg-cream-100 rounded-md border p-4 text-sm">
        <p className="font-semibold">
          {isQris ? "Pembayaran QRIS" : "Pembayaran Tunai"}
        </p>
        <p className="text-ink-700 mt-1">
          {isQris
            ? "Scan kode QRIS yang tersedia di meja kasir, lalu tunjukkan bukti bayar beserta nomor antrean ini."
            : "Bayar tunai di kasir sambil menyebutkan nomor antrean di atas."}
        </p>
        <p className="text-muted mt-2">
          Kasir akan menandai pembayaranmu sebagai lunas setelah diverifikasi.
        </p>
      </div>

      <Button size="lg" block onClick={onOrderAgain}>
        Pesan Lagi
      </Button>
    </div>
  );
}
