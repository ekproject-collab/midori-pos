import type { Kategori } from "@/types";

import { getSupabaseClient } from "./client";
import { fail, ok, runQuery, type Result } from "./result";

/** All categories, ordered for display. Public (kiosk + admin). */
export async function listCategories(): Promise<Result<Kategori[]>> {
  return runQuery(
    getSupabaseClient()
      .from("kategori")
      .select("*")
      .order("id_kategori", { ascending: true }),
  );
}

/** Admin: create a category. */
export async function createCategory(
  namaKategori: string,
): Promise<Result<Kategori>> {
  const nama = namaKategori.trim();
  if (!nama) return fail("Nama kategori wajib diisi.");
  return runQuery(
    getSupabaseClient()
      .from("kategori")
      .insert({ nama_kategori: nama })
      .select()
      .single(),
  );
}

/** Admin: rename a category. */
export async function updateCategory(
  idKategori: number,
  namaKategori: string,
): Promise<Result<Kategori>> {
  const nama = namaKategori.trim();
  if (!nama) return fail("Nama kategori wajib diisi.");
  return runQuery(
    getSupabaseClient()
      .from("kategori")
      .update({ nama_kategori: nama })
      .eq("id_kategori", idKategori)
      .select()
      .single(),
  );
}

/**
 * Admin: delete a category. Fails (FK restrict) if it still has products —
 * mapped to a clear message.
 */
export async function deleteCategory(
  idKategori: number,
): Promise<Result<null>> {
  const { error } = await getSupabaseClient()
    .from("kategori")
    .delete()
    .eq("id_kategori", idKategori);

  if (error) {
    if (error.code === "23503") {
      return fail(
        "Kategori masih memiliki produk. Pindahkan atau hapus produk dulu.",
      );
    }
    return fail(error.message);
  }
  return ok(null);
}
