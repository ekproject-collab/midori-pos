"use client";

import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatJakartaTime, formatRupiah } from "@/lib/format";
import type {
  PesananWithDetail,
  StatusPembayaran,
  StatusPesanan,
} from "@/types";

export interface OrderCardProps {
  order: PesananWithDetail;
  isNew?: boolean;
  onStatus: (status: StatusPesanan) => void;
  onPaid: (status: StatusPembayaran) => void;
}

export function OrderCard({ order, isNew, onStatus, onPaid }: OrderCardProps) {
  const paid = order.status_pembayaran === "paid";

  return (
    <article
      className={cn(
        "bg-surface space-y-3 rounded-md border p-3",
        isNew ? "border-matcha-600 shadow-hard-sm" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold tabular-nums">
            #{order.id_pesanan}{" "}
            <span className="font-semibold">{order.nama_pelanggan}</span>
          </p>
          <p className="text-muted text-xs">
            {formatJakartaTime(order.waktu_pesanan)}
          </p>
        </div>
        {isNew && <Badge tone="matcha">Baru</Badge>}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge tone="info">
          {order.tipe_pesanan === "dine_in"
            ? order.nomor_meja
              ? `Dine-in · Meja ${order.nomor_meja}`
              : "Dine-in"
            : "Takeaway"}
        </Badge>
        <Badge tone="neutral">
          {order.metode_pembayaran === "qris" ? "QRIS" : "Cash"}
        </Badge>
        <Badge tone={paid ? "success" : "warning"}>
          {paid ? "Lunas" : "Belum dibayar"}
        </Badge>
      </div>

      <ul className="border-border space-y-0.5 border-t pt-2 text-sm">
        {order.detail_pesanan.map((line) => (
          <li key={line.id_detail} className="flex justify-between gap-2">
            <span>
              <span className="tabular-nums">{line.kuantitas}×</span>{" "}
              {line.produk?.nama_produk ?? `#${line.id_produk}`}
            </span>
            <span className="text-muted tabular-nums">
              {formatRupiah(line.subtotal)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-border flex justify-between border-t pt-2 text-sm font-bold">
        <span>Total</span>
        <span className="tabular-nums">{formatRupiah(order.total_harga)}</span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {order.status_pesanan === "new" && (
          <Button size="sm" onClick={() => onStatus("preparing")}>
            Mulai Siapkan
          </Button>
        )}
        {order.status_pesanan === "preparing" && (
          <>
            <Button size="sm" onClick={() => onStatus("done")}>
              Selesai
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onStatus("new")}>
              ← Kembali
            </Button>
          </>
        )}
        {order.status_pesanan === "done" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStatus("preparing")}
          >
            ↩ Buka lagi
          </Button>
        )}

        <Button
          size="sm"
          variant={paid ? "ghost" : "secondary"}
          onClick={() => onPaid(paid ? "unpaid" : "paid")}
        >
          {paid ? "Batalkan Lunas" : "Tandai Lunas"}
        </Button>
      </div>
    </article>
  );
}
