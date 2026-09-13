"use client";

import { useCallback, useEffect, useState } from "react";

import { useToast } from "@/components/ui";
import {
  closeDailyRecap,
  getDailySales,
  listRecaps,
  listUnclosedDays,
} from "@/services/supabase";
import type { DailySales, RekapHarian, UnclosedDay } from "@/types";

interface ReportsState {
  today: DailySales | null;
  history: RekapHarian[];
  unclosed: UnclosedDay[];
  loading: boolean;
  error: string | null;
}

async function fetchReports(): Promise<ReportsState> {
  const [sales, recaps, unclosed] = await Promise.all([
    getDailySales(),
    listRecaps(),
    listUnclosedDays(),
  ]);
  if (sales.error !== null) {
    return {
      today: null,
      history: [],
      unclosed: [],
      loading: false,
      error: sales.error,
    };
  }
  if (recaps.error !== null) {
    return {
      today: null,
      history: [],
      unclosed: [],
      loading: false,
      error: recaps.error,
    };
  }
  // Unclosed-days lookup is a nice-to-have banner — don't fail the whole page
  // over it if it errors.
  return {
    today: sales.data,
    history: recaps.data,
    unclosed: unclosed.error === null ? unclosed.data : [],
    loading: false,
    error: null,
  };
}

/**
 * Admin reports (PRD 2.1.B steps 5-6): today's live sales figures + the
 * history of closed days, plus the "Tutup Buku" action. Also surfaces past
 * days that were never closed (e.g. the admin missed it before the date
 * rolled over) so they can be closed retroactively — no order data is ever
 * lost, but the daily rekap snapshot only exists once closed.
 */
export function useReports() {
  const toast = useToast();
  const [state, setState] = useState<ReportsState>({
    today: null,
    history: [],
    unclosed: [],
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

  const closeDay = useCallback(
    async (tanggal?: string): Promise<boolean> => {
      setClosing(true);
      const result = await closeDailyRecap(tanggal);
      setClosing(false);
      if (result.error !== null) {
        toast.show(result.error, "danger");
        return false;
      }
      toast.show(
        tanggal
          ? `Buku tanggal ${tanggal} berhasil ditutup.`
          : "Buku hari ini berhasil ditutup.",
        "success",
      );
      await refetch();
      return true;
    },
    [toast, refetch],
  );

  return {
    ...state,
    closing,
    refetch,
    closeToday: () => closeDay(),
    closeDay,
  };
}
