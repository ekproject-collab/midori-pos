"use client";

import { useEffect, useRef, useState } from "react";

import { useOrderQueue } from "@/hooks/useOrderQueue";
import { Button, EmptyState, Pagination, Skeleton } from "@/components/ui";
import { playChime } from "@/lib/beep";
import { formatJakartaDate } from "@/lib/format";
import type { StatusPesanan } from "@/types";

import { OrderCard } from "./OrderCard";

const COLUMNS: { status: StatusPesanan; label: string }[] = [
  { status: "new", label: "Baru" },
  { status: "preparing", label: "Sedang Disiapkan" },
  { status: "done", label: "Selesai" },
];

const SOUND_KEY = "midori-queue-sound";
const PAGE_SIZE = 5;

export function OrderQueueBoard() {
  const { orders, loading, error, newIds, refetch, setStatus, setPaid } =
    useOrderQueue();

  const [soundOn, setSoundOn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SOUND_KEY) !== "0";
    } catch {
      return true;
    }
  });
  const seenNew = useRef<Set<number>>(new Set());
  const [pages, setPages] = useState<Record<StatusPesanan, number>>({
    new: 1,
    preparing: 1,
    done: 1,
  });

  // chime when a genuinely new order id appears
  useEffect(() => {
    let fresh = false;
    for (const id of newIds) {
      if (!seenNew.current.has(id)) {
        seenNew.current.add(id);
        fresh = true;
      }
    }
    if (fresh && soundOn) playChime();
  }, [newIds, soundOn]);

  const toggleSound = () => {
    setSoundOn((on) => {
      const next = !on;
      try {
        localStorage.setItem(SOUND_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      if (next) playChime();
      return next;
    });
  };

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((c) => (
          <Skeleton key={c.status} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Gagal memuat pesanan"
        description={error}
        icon="⚠️"
        action={<Button onClick={refetch}>Coba lagi</Button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted text-sm">
          {formatJakartaDate(new Date().toISOString())} · {orders.length}{" "}
          pesanan
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={toggleSound}>
            {soundOn ? "🔔 Suara: ON" : "🔕 Suara: OFF"}
          </Button>
          <Button size="sm" variant="secondary" onClick={refetch}>
            Segarkan
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = orders.filter((o) => o.status_pesanan === col.status);
          const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
          const page = Math.min(pages[col.status], totalPages);
          const pageItems = items.slice(
            (page - 1) * PAGE_SIZE,
            page * PAGE_SIZE,
          );

          return (
            <section
              key={col.status}
              className="border-border bg-cream-100 rounded-md border"
            >
              <header className="border-border flex items-center justify-between border-b px-3 py-2">
                <span className="font-semibold">{col.label}</span>
                <span className="bg-surface rounded-sm px-2 text-sm font-semibold tabular-nums">
                  {items.length}
                </span>
              </header>
              <div className="space-y-3 p-3">
                {items.length === 0 ? (
                  <p className="text-muted py-6 text-center text-sm">
                    Tidak ada pesanan
                  </p>
                ) : (
                  <>
                    {pageItems.map((order) => (
                      <OrderCard
                        key={order.id_pesanan}
                        order={order}
                        isNew={newIds.has(order.id_pesanan)}
                        onStatus={(status) =>
                          setStatus(order.id_pesanan, status)
                        }
                        onPaid={(status) => setPaid(order.id_pesanan, status)}
                      />
                    ))}
                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      onChange={(next) =>
                        setPages((prev) => ({ ...prev, [col.status]: next }))
                      }
                    />
                  </>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
