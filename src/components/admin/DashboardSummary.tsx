"use client";

import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui";
import { getDailySales, listOrdersForDay } from "@/services/supabase";
import { formatRupiah } from "@/lib/format";

import { StatTile } from "./StatTile";

interface Summary {
  totalTransaksi: number;
  pendapatan: number;
  perluDiproses: number;
  closed: boolean;
  loading: boolean;
  error: string | null;
}

const initial: Summary = {
  totalTransaksi: 0,
  pendapatan: 0,
  perluDiproses: 0,
  closed: false,
  loading: true,
  error: null,
};

async function fetchSummary(): Promise<Summary> {
  const [sales, orders] = await Promise.all([
    getDailySales(),
    listOrdersForDay(),
  ]);

  if (sales.error !== null) {
    return { ...initial, loading: false, error: sales.error };
  }

  const perluDiproses = (orders.data ?? []).filter(
    (o) => o.status_pesanan !== "done",
  ).length;

  return {
    totalTransaksi: sales.data.total_transaksi,
    pendapatan: sales.data.total_pendapatan_keseluruhan,
    perluDiproses,
    closed: sales.data.sudah_ditutup,
    loading: false,
    error: null,
  };
}

export function DashboardSummary() {
  const [s, setS] = useState<Summary>(initial);

  useEffect(() => {
    let active = true;
    fetchSummary().then((next) => {
      if (active) setS(next);
    });
    return () => {
      active = false;
    };
  }, []);

  if (s.loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (s.error) {
    return (
      <p className="border-border bg-surface text-muted rounded-md border p-4 text-sm">
        Ringkasan tidak tersedia: {s.error}
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile label="Pesanan Hari Ini" value={String(s.totalTransaksi)} />
      <StatTile
        label="Perlu Diproses"
        value={String(s.perluDiproses)}
        accent={s.perluDiproses > 0}
        href="/admin/orders"
      />
      <StatTile
        label="Pendapatan Hari Ini"
        value={formatRupiah(s.pendapatan)}
      />
      <StatTile
        label="Tutup Buku"
        value={s.closed ? "Sudah" : "Belum"}
        href="/admin/reports"
      />
    </div>
  );
}
