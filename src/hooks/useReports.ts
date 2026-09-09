"use client";

import { useCallback, useEffect, useState } from "react";

import { useToast } from "@/components/ui";
import {
  closeDailyRecap,
  getDailySales,
  listRecaps,
} from "@/services/supabase";
import type { DailySales, RekapHarian } from "@/types";

interface ReportsState {
  today: DailySales | null;
  history: RekapHarian[];
  loading: boolean;
  error: string | null;
}

async function fetchReports(): Promise<ReportsState> {
  const [sales, recaps] = await Promise.all([getDailySales(), listRecaps()]);
  if (sales.error !== null) {
    return { today: null, history: [], loading: false, error: sales.error };
  }
  if (recaps.error !== null) {
    return { today: null, history: [], loading: false, error: recaps.error };
  }
  return {
    today: sales.data,
    history: recaps.data,
    loading: false,
    error: null,
  };
}

/**
 * Admin reports (PRD 2.1.B steps 5-6): today's live sales figures + the
 * history of closed days, plus the "Tutup Buku" action.
 */
export function useReports() {
  const toast = useToast();
  const [state, setState] = useState<ReportsState>({
    today: null,
    history: [],
    loading: true,
    error: null,
  });
  const [closing, setClosing] = useState(false);

  const refetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    setState(await fetchReports());
  }, []);

  useEffect(() => {
    let active = true;
    fetchReports().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, []);

  const closeToday = useCallback(async (): Promise<boolean> => {
    setClosing(true);
    const result = await closeDailyRecap();
    setClosing(false);
    if (result.error !== null) {
      toast.show(result.error, "danger");
      return false;
    }
    toast.show("Buku hari ini berhasil ditutup.", "success");
    await refetch();
    return true;
  }, [toast, refetch]);

  return { ...state, closing, refetch, closeToday };
}
