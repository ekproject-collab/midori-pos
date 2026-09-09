import type {
  MetodePembayaran,
  OrderItemInput,
  Pesanan,
  PesananWithDetail,
  StatusPembayaran,
  StatusPesanan,
  TipePesanan,
} from "@/types";

import { jakartaToday } from "@/lib/format";

import { getSupabaseClient } from "./client";
import { fail, ok, runQuery, type Result } from "./result";

export interface CreateOrderInput {
  namaPelanggan: string;
  tipePesanan: TipePesanan;
  nomorMeja: string | null;
  metodePembayaran: MetodePembayaran;
  items: OrderItemInput[];
}

const WITH_DETAIL = "*, detail_pesanan(*, produk(*))" as const;

/**
 * Kiosk: create an order atomically via the `create_order` RPC.
 * The DB re-prices every line from the live catalog; the returned row is the
 * source of truth for the receipt (id_pesanan = queue number).
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<Result<Pesanan>> {
  if (input.items.length === 0) return fail("Keranjang masih kosong.");

  const { data, error } = await getSupabaseClient().rpc("create_order", {
    p_nama_pelanggan: input.namaPelanggan.trim(),
    p_tipe_pesanan: input.tipePesanan,
    p_nomor_meja: input.nomorMeja?.trim() || null,
    p_metode_pembayaran: input.metodePembayaran,
    p_items: input.items,
  });

  if (error) return fail(error.message);
  if (!data) return fail("Pesanan gagal dibuat.");
  return ok(data as Pesanan);
}

/**
 * Admin: orders for a given shop-day (default: today, Asia/Jakarta), oldest
 * first so the queue reads top-to-bottom in the order things should be made.
 */
export async function listOrdersForDay(
  tanggal?: string,
): Promise<Result<PesananWithDetail[]>> {
  const day = tanggal ?? jakartaToday();
  return runQuery(
    getSupabaseClient()
      .from("pesanan")
      .select(WITH_DETAIL)
      .gte("waktu_pesanan", `${day}T00:00:00+07:00`)
      .lt("waktu_pesanan", `${day}T23:59:59.999+07:00`)
      .order("waktu_pesanan", { ascending: true }),
  );
}

/** Admin: one order with its line items. */
export async function getOrder(
  idPesanan: number,
): Promise<Result<PesananWithDetail>> {
  return runQuery(
    getSupabaseClient()
      .from("pesanan")
      .select(WITH_DETAIL)
      .eq("id_pesanan", idPesanan)
      .single(),
  );
}

/** Admin: move an order through New → Preparing → Done. */
export async function updateOrderStatus(
  idPesanan: number,
  status: StatusPesanan,
): Promise<Result<Pesanan>> {
  return runQuery(
    getSupabaseClient()
      .from("pesanan")
      .update({ status_pesanan: status })
      .eq("id_pesanan", idPesanan)
      .select()
      .single(),
  );
}

/** Admin: mark payment as paid / unpaid. */
export async function updatePaymentStatus(
  idPesanan: number,
  status: StatusPembayaran,
): Promise<Result<Pesanan>> {
  return runQuery(
    getSupabaseClient()
      .from("pesanan")
      .update({ status_pembayaran: status })
      .eq("id_pesanan", idPesanan)
      .select()
      .single(),
  );
}
