"use client";

import { useState } from "react";

import { useReports } from "@/hooks/useReports";
import { Badge, Button, EmptyState, Modal, Skeleton } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  formatJakartaDate,
  formatJakartaTime,
  formatRupiah,
  jakartaToday,
} from "@/lib/format";
import type { RekapHarian } from "@/types";

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="border-border bg-surface rounded-md border p-4">
      <p className="text-muted text-xs font-semibold tracking-wide uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
          accent && "text-matcha-800",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function downloadCsv(rows: RekapHarian[]) {
  const header = [
    "tanggal",
    "total_transaksi",
    "pendapatan_cash",
    "pendapatan_qris",
    "pendapatan_keseluruhan",
    "waktu_tutup",
  ];
  const body = rows.map((r) =>
    [
      r.tanggal,
      r.total_transaksi,
      r.total_pendapatan_cash,
      r.total_pendapatan_qris,
      r.total_pendapatan_keseluruhan,
      r.waktu_tutup,
    ].join(","),
  );
  const csv = [header.join(","), ...body].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `rekap-midori-${jakartaToday()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsView() {
  const { today, history, loading, error, closing, refetch, closeToday } =
    useReports();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (loading) return <Skeleton className="h-72 w-full" />;

  if (error || !today) {
    return (
      <EmptyState
        title="Gagal memuat laporan"
        description={error ?? "Data tidak tersedia."}
        icon="⚠️"
        action={<Button onClick={refetch}>Coba lagi</Button>}
      />
    );
  }

  const closedToday = today.sudah_ditutup;
  const canClose = !closedToday && today.total_transaksi > 0;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">
            Rekap Hari Ini · {formatJakartaDate(new Date().toISOString())}
          </h2>
          {closedToday ? (
            <Badge tone="success">Sudah ditutup</Badge>
          ) : (
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!canClose}
              title={
                today.total_transaksi === 0
                  ? "Belum ada transaksi hari ini"
                  : undefined
              }
            >
              Tutup Buku Hari Ini
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total Transaksi" value={String(today.total_transaksi)} />
          <Stat
            label="Pendapatan Cash"
            value={formatRupiah(today.total_pendapatan_cash)}
          />
          <Stat
            label="Pendapatan QRIS"
            value={formatRupiah(today.total_pendapatan_qris)}
          />
          <Stat
            label="Total Pendapatan"
            value={formatRupiah(today.total_pendapatan_keseluruhan)}
            accent
          />
        </div>

        {closedToday && (
          <p className="text-muted text-sm">
            Buku hari ini sudah ditutup. Angka di atas tetap menghitung semua
            pesanan hari ini; angka resmi yang tersimpan ada di riwayat.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold">Riwayat Tutup Buku</h2>
          {history.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => downloadCsv(history)}
            >
              Unduh CSV
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <EmptyState
            title="Belum ada riwayat"
            description="Rekap harian akan muncul di sini setelah tutup buku pertama."
            icon="📄"
          />
        ) : (
          <div className="border-border overflow-x-auto rounded-md border">
            <table className="w-full min-w-xl text-sm">
              <thead className="border-border bg-cream-100 border-b text-left">
                <tr>
                  <th className="p-2 font-semibold">Tanggal</th>
                  <th className="p-2 text-right font-semibold">Transaksi</th>
                  <th className="p-2 text-right font-semibold">Cash</th>
                  <th className="p-2 text-right font-semibold">QRIS</th>
                  <th className="p-2 text-right font-semibold">Total</th>
                  <th className="p-2 font-semibold">Ditutup</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {history.map((r) => (
                  <tr key={r.id_rekap}>
                    <td className="p-2">
                      {formatJakartaDate(`${r.tanggal}T00:00:00+07:00`)}
                    </td>
                    <td className="p-2 text-right tabular-nums">
                      {r.total_transaksi}
                    </td>
                    <td className="p-2 text-right tabular-nums">
                      {formatRupiah(r.total_pendapatan_cash)}
                    </td>
                    <td className="p-2 text-right tabular-nums">
                      {formatRupiah(r.total_pendapatan_qris)}
                    </td>
                    <td className="p-2 text-right font-semibold tabular-nums">
                      {formatRupiah(r.total_pendapatan_keseluruhan)}
                    </td>
                    <td className="text-muted p-2">
                      {formatJakartaTime(r.waktu_tutup)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Tutup buku hari ini?"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={closing}
            >
              Batal
            </Button>
            <Button
              onClick={async () => {
                const ok = await closeToday();
                if (ok) setConfirmOpen(false);
              }}
              disabled={closing}
            >
              {closing ? "Menutup…" : "Ya, Tutup Buku"}
            </Button>
          </>
        }
      >
        <div className="space-y-2 text-sm">
          <p className="text-muted">
            Angka hari ini akan dikunci dan disimpan sebagai riwayat. Tidak bisa
            ditutup dua kali untuk tanggal yang sama.
          </p>
          <ul className="border-border border-t pt-2">
            <li className="flex justify-between">
              <span>Total transaksi</span>
              <span className="font-semibold tabular-nums">
                {today.total_transaksi}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Cash</span>
              <span className="tabular-nums">
                {formatRupiah(today.total_pendapatan_cash)}
              </span>
            </li>
            <li className="flex justify-between">
              <span>QRIS</span>
              <span className="tabular-nums">
                {formatRupiah(today.total_pendapatan_qris)}
              </span>
            </li>
            <li className="border-border flex justify-between border-t pt-1 font-bold">
              <span>Total</span>
              <span className="tabular-nums">
                {formatRupiah(today.total_pendapatan_keseluruhan)}
              </span>
            </li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}
