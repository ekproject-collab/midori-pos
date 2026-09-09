import type { Database } from "@/types/database";
import type { Produk, ProdukWithKategori } from "@/types";

import { getSupabaseClient } from "./client";
import { runQuery, type Result } from "./result";

type ProdukInsert = Database["public"]["Tables"]["produk"]["Insert"];
type ProdukUpdate = Database["public"]["Tables"]["produk"]["Update"];

const WITH_KATEGORI = "*, kategori(*)" as const;

/**
 * Kiosk catalog: every non-deleted product (available and Sold Out alike —
 * the UI greys out unavailable ones, per PRD 2.2), with its category.
 */
export async function listCatalogProducts(): Promise<
  Result<ProdukWithKategori[]>
> {
  return runQuery(
    getSupabaseClient()
      .from("produk")
      .select(WITH_KATEGORI)
      .is("deleted_at", null)
      .order("id_kategori", { ascending: true })
      .order("nama_produk", { ascending: true }),
  );
}

/** Admin product list. Soft-deleted rows are excluded unless asked for. */
export async function listProductsForAdmin(
  opts: { includeDeleted?: boolean } = {},
): Promise<Result<ProdukWithKategori[]>> {
  let query = getSupabaseClient()
    .from("produk")
    .select(WITH_KATEGORI)
    .order("id_kategori", { ascending: true })
    .order("nama_produk", { ascending: true });

  if (!opts.includeDeleted) query = query.is("deleted_at", null);

  return runQuery(query);
}

/** Admin: create a product. */
export async function createProduct(
  input: ProdukInsert,
): Promise<Result<Produk>> {
  return runQuery(
    getSupabaseClient().from("produk").insert(input).select().single(),
  );
}

/** Admin: update editable fields of a product. */
export async function updateProduct(
  idProduk: number,
  patch: ProdukUpdate,
): Promise<Result<Produk>> {
  return runQuery(
    getSupabaseClient()
      .from("produk")
      .update(patch)
      .eq("id_produk", idProduk)
      .select()
      .single(),
  );
}

/** Admin: toggle Available / Sold Out. */
export async function setProductAvailability(
  idProduk: number,
  isAvailable: boolean,
): Promise<Result<Produk>> {
  return updateProduct(idProduk, { is_available: isAvailable });
}

/** Admin: soft delete — hides the product but keeps order history intact. */
export async function softDeleteProduct(
  idProduk: number,
): Promise<Result<Produk>> {
  return updateProduct(idProduk, { deleted_at: new Date().toISOString() });
}

/** Admin: undo a soft delete. */
export async function restoreProduct(
  idProduk: number,
): Promise<Result<Produk>> {
  return updateProduct(idProduk, { deleted_at: null });
}
