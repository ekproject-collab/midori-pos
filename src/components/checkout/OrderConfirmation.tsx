"use client";

import Image from "next/image";

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
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-4xl">🍵</p>
        <h1 className="text-3xl font-bold">Pesanan diterima</h1>
        <p className="text-muted text-lg">
          Pesananmu sudah dikirim ke dapur. Tunjukkan nomor ini di kasir.
        </p>
      </div>

      {/* Queue number */}
      <div className="border-ink-900 bg-matcha-50 shadow-hard-sm rounded-md border p-8 text-center">
        <p className="text-muted text-sm font-semibold tracking-wide uppercase">
          Nomor Antrean
        </p>
        <p className="text-matcha-800 text-7xl font-bold tabular-nums">
          #{order.id_pesanan}
        </p>
      </div>

      {/* Order detail */}
      <div className="border-border bg-surface space-y-4 rounded-md border p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-base">
          <span className="font-semibold">{order.nama_pelanggan}</span>
          <span className="text-muted">
            {formatJakartaTime(order.waktu_pesanan)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="info">
            {order.tipe_pesanan === "dine_in"
              ? order.nomor_meja
                ? `Dine-in · Meja ${order.nomor_meja}`
                : "Dine-in"
              : "Takeaway"}
          </Badge>
          <Badge tone="neutral">{isQris ? "QRIS" : "Cash"}</Badge>
          <Badge tone="warning">Belum dibayar</Badge>
        </div>

        <ul className="border-border space-y-2 border-t pt-4 text-base">
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
        <div className="border-border flex justify-between border-t pt-4 text-lg font-bold">
          <span>Total</span>
          <span className="tabular-nums">
            {formatRupiah(order.total_harga)}
          </span>
        </div>
      </div>

      {/* Payment instructions */}
      <div className="border-border bg-cream-100 rounded-md border p-5 text-base">
        <p className="font-semibold">
          {isQris ? "Pembayaran QRIS" : "Pembayaran Tunai"}
        </p>
        <p className="text-ink-700 mt-1">
          {isQris
            ? "Scan kode QRIS di bawah ini, lalu tunjukkan bukti bayar beserta nomor antrean ini di kasir."
            : "Bayar tunai di kasir sambil menyebutkan nomor antrean di atas."}
        </p>
        {isQris && (
          <div className="border-border bg-surface mt-4 flex justify-center rounded-md border p-4">
            <Image
              src="/payment/qris.png"
              alt="Kode QRIS untuk pembayaran"
              width={1137}
              height={1600}
              className="h-auto w-full max-w-60"
            />
          </div>
        )}
        <p className="text-muted mt-2">
          Kasir akan menandai pembayaranmu sebagai lunas setelah diverifikasi.
        </p>
      </div>

      <Button size="xl" block onClick={onOrderAgain}>
        Pesan Lagi
      </Button>
    </div>
  );
}
