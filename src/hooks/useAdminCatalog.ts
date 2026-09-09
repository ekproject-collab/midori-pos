"use client";

import { useCallback, useEffect, useState } from "react";

import { useToast } from "@/components/ui";
import {
  createCategory,
  createProduct,
  deleteCategory,
  listCategories,
  listProductsForAdmin,
  setProductAvailability,
  softDeleteProduct,
  updateCategory,
  updateProduct,
} from "@/services/supabase";
import type { Database } from "@/types/database";
import type { Kategori, ProdukWithKategori } from "@/types";

type ProdukInsert = Database["public"]["Tables"]["produk"]["Insert"];
type ProdukUpdate = Database["public"]["Tables"]["produk"]["Update"];

interface State {
  categories: Kategori[];
  products: ProdukWithKategori[];
  loading: boolean;
  error: string | null;
}

async function fetchState(): Promise<State> {
  const [cats, prods] = await Promise.all([
    listCategories(),
    listProductsForAdmin(),
  ]);
  if (cats.error !== null) {
    return { categories: [], products: [], loading: false, error: cats.error };
  }
  if (prods.error !== null) {
    return {
      categories: [],
      products: [],
      loading: false,
      error: prods.error,
    };
  }
  return {
    categories: cats.data,
    products: prods.data,
    loading: false,
    error: null,
  };
}

/**
 * Admin catalog data + mutations. Mutations refetch on success (simple and
 * always consistent); the availability toggle is optimistic so it feels
 * instant. Errors surface as toasts; each action resolves to a boolean so
 * callers (modals) know whether to close.
 */
export function useAdminCatalog() {
  const toast = useToast();
  const [state, setState] = useState<State>({
    categories: [],
    products: [],
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    setState(await fetchState());
  }, []);

  useEffect(() => {
    let active = true;
    fetchState().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, []);

  const run = useCallback(
    async (
      op: () => Promise<{ error: string | null }>,
      successMsg?: string,
    ): Promise<boolean> => {
      const { error } = await op();
      if (error !== null) {
        toast.show(error, "danger");
        return false;
      }
      if (successMsg) toast.show(successMsg, "success");
      await refetch();
      return true;
    },
    [toast, refetch],
  );

  return {
    ...state,
    refetch,

    addCategory: (nama: string) =>
      run(() => createCategory(nama), "Kategori ditambahkan."),
    renameCategory: (id: number, nama: string) =>
      run(() => updateCategory(id, nama)),
    removeCategory: (id: number) =>
      run(() => deleteCategory(id), "Kategori dihapus."),

    addProduct: (input: ProdukInsert) =>
      run(() => createProduct(input), "Produk ditambahkan."),
    editProduct: (id: number, patch: ProdukUpdate) =>
      run(() => updateProduct(id, patch), "Produk diperbarui."),
    removeProduct: (id: number) =>
      run(() => softDeleteProduct(id), "Produk dihapus."),

    toggleAvailability: async (id: number, next: boolean) => {
      setState((s) => ({
        ...s,
        products: s.products.map((p) =>
          p.id_produk === id ? { ...p, is_available: next } : p,
        ),
      }));
      const { error } = await setProductAvailability(id, next);
      if (error !== null) {
        toast.show(error, "danger");
        await refetch();
      }
    },
  };
}
