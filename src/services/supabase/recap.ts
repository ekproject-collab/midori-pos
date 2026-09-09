import type { DailySales, RekapHarian } from "@/types";

import { getSupabaseClient } from "./client";
import { fail, ok, runQuery, type Result } from "./result";

/**
 * Admin: live sales figures for a shop-day (default today), before close.
 * Counts ALL orders for the date — no status filter (business decision).
 */
export async function getDailySales(
  tanggal?: string,
): Promise<Result<DailySales>> {
  const { data, error } = await getSupabaseClient().rpc("get_daily_sales", {
    p_tanggal: tanggal,
  });

  if (error) return fail(error.message);
  const row = data?.[0];
  if (!row) return fail("Data penjualan tidak tersedia.");
  return ok(row);
}

/**
 * Admin: "Tutup Buku" — lock the day's figures into rekap_harian.
 * Fails if the date is already closed.
 */
export async function closeDailyRecap(
  tanggal?: string,
): Promise<Result<RekapHarian>> {
  const { data, error } = await getSupabaseClient().rpc("close_daily_recap", {
    p_tanggal: tanggal,
  });

  if (error) return fail(error.message);
  if (!data) return fail("Gagal menutup buku.");
  return ok(data as RekapHarian);
}

/** Admin: history of closed days, newest first. */
export async function listRecaps(): Promise<Result<RekapHarian[]>> {
  return runQuery(
    getSupabaseClient()
      .from("rekap_harian")
      .select("*")
      .order("tanggal", { ascending: false }),
  );
}
