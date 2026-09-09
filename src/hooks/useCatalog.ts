"use client";

import { useCallback, useEffect, useState } from "react";

import { listCatalogProducts, listCategories } from "@/services/supabase";
import type { Kategori, ProdukWithKategori } from "@/types";

interface CatalogState {
  categories: Kategori[];
  /** Products grouped by id_kategori, each list ordered by name. */
  productsByCategory: Map<number, ProdukWithKategori[]>;
  loading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  categories: [],
  productsByCategory: new Map(),
  loading: true,
  error: null,
};

async function fetchCatalog(): Promise<CatalogState> {
  const [cats, prods] = await Promise.all([
    listCategories(),
    listCatalogProducts(),
  ]);

  if (cats.error !== null) {
    return { ...initialState, loading: false, error: cats.error };
  }
  if (prods.error !== null) {
    return { ...initialState, loading: false, error: prods.error };
  }

  const productsByCategory = new Map<number, ProdukWithKategori[]>();
  for (const product of prods.data) {
    const list = productsByCategory.get(product.id_kategori) ?? [];
    list.push(product);
    productsByCategory.set(product.id_kategori, list);
  }

  return {
    categories: cats.data,
    productsByCategory,
    loading: false,
    error: null,
  };
}

/**
 * Loads the kiosk catalog (categories + non-deleted products) via the service
 * layer. Exposes an explicit error string and a `refetch` so the kiosk can
 * recover from a dropped connection without crashing (AGENTS.md Section 3).
 */
export function useCatalog() {
  const [state, setState] = useState<CatalogState>(initialState);

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchCatalog().then(setState);
  }, []);

  useEffect(() => {
    let active = true;
    fetchCatalog().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, []);

  return { ...state, refetch };
}
