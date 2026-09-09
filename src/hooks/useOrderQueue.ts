"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useToast } from "@/components/ui";
import {
  getOrder,
  listOrdersForDay,
  updateOrderStatus,
  updatePaymentStatus,
} from "@/services/supabase";
import { getSupabaseClient } from "@/services/supabase/client";
import type {
  Pesanan,
  PesananWithDetail,
  StatusPembayaran,
  StatusPesanan,
} from "@/types";

const NEW_HIGHLIGHT_MS = 30_000;

interface QueueState {
  orders: PesananWithDetail[];
  loading: boolean;
  error: string | null;
}

function sortByTime(orders: PesananWithDetail[]): PesananWithDetail[] {
  return [...orders].sort(
    (a, b) => Date.parse(a.waktu_pesanan) - Date.parse(b.waktu_pesanan),
  );
}

/** Merge a raw pesanan row (from realtime) into a loaded order, keeping detail. */
function mergeRow(
  list: PesananWithDetail[],
  row: Pesanan,
): PesananWithDetail[] {
  return list.map((o) =>
    o.id_pesanan === row.id_pesanan ? { ...o, ...row } : o,
  );
}

/**
 * Live order queue for the admin (PRD 2.1.B). Loads today's orders and keeps
 * them in sync via Supabase Realtime on the `pesanan` table. Status/payment
 * mutations are optimistic and reconcile against the service response.
 */
export function useOrderQueue() {
  const toast = useToast();
  const [state, setState] = useState<QueueState>({
    orders: [],
    loading: true,
    error: null,
  });
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const clearHighlight = useCallback((id: number) => {
    setNewIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  const markNew = useCallback(
    (id: number) => {
      setNewIds((prev) => new Set(prev).add(id));
      const existing = timers.current.get(id);
      if (existing) clearTimeout(existing);
      timers.current.set(
        id,
        setTimeout(() => clearHighlight(id), NEW_HIGHLIGHT_MS),
      );
    },
    [clearHighlight],
  );

  const fetchOrders = useCallback(async (): Promise<QueueState> => {
    const result = await listOrdersForDay();
    if (result.error !== null) {
      return { orders: [], loading: false, error: result.error };
    }
    return { orders: sortByTime(result.data), loading: false, error: null };
  }, []);

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchOrders().then(setState);
  }, [fetchOrders]);

  // initial load
  useEffect(() => {
    let active = true;
    fetchOrders().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, [fetchOrders]);

  // realtime subscription
  useEffect(() => {
    const supabase = getSupabaseClient();
    let cancelled = false;

    const setup = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) await supabase.realtime.setAuth(session.access_token);
      if (cancelled) return;

      const channel = supabase
        .channel("admin-order-queue")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "pesanan" },
          async (payload) => {
            const row = payload.new as Pesanan;
            const full = await getOrder(row.id_pesanan);
            if (full.error !== null) return;
            setState((s) => {
              if (s.orders.some((o) => o.id_pesanan === row.id_pesanan)) {
                return s;
              }
              return { ...s, orders: sortByTime([...s.orders, full.data]) };
            });
            markNew(row.id_pesanan);
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "pesanan" },
          (payload) => {
            const row = payload.new as Pesanan;
            setState((s) => ({ ...s, orders: mergeRow(s.orders, row) }));
          },
        )
        .subscribe();

      return channel;
    };

    const channelPromise = setup();
    return () => {
      cancelled = true;
      channelPromise.then((channel) => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, [markNew]);

  // clear all pending highlight timers on unmount
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  const setStatus = useCallback(
    async (id: number, status: StatusPesanan) => {
      clearHighlight(id);
      const prev = state.orders;
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id_pesanan === id ? { ...o, status_pesanan: status } : o,
        ),
      }));
      const result = await updateOrderStatus(id, status);
      if (result.error !== null) {
        setState((s) => ({ ...s, orders: prev }));
        toast.show(result.error, "danger");
      }
    },
    [state.orders, toast, clearHighlight],
  );

  const setPaid = useCallback(
    async (id: number, status: StatusPembayaran) => {
      const prev = state.orders;
      setState((s) => ({
        ...s,
        orders: s.orders.map((o) =>
          o.id_pesanan === id ? { ...o, status_pembayaran: status } : o,
        ),
      }));
      const result = await updatePaymentStatus(id, status);
      if (result.error !== null) {
        setState((s) => ({ ...s, orders: prev }));
        toast.show(result.error, "danger");
      }
    },
    [state.orders, toast],
  );

  return {
    orders: state.orders,
    loading: state.loading,
    error: state.error,
    newIds,
    refetch,
    setStatus,
    setPaid,
  };
}
