import type { CartAction, CartItem, CartState } from "./types";

const MAX_QTY_PER_ITEM = 99;

function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return 0;
  return Math.max(0, Math.min(MAX_QTY_PER_ITEM, Math.trunc(qty)));
}

/**
 * Pure cart reducer — no React, no I/O, fully unit-testable (AGENTS.md §2).
 * Setting a quantity to 0 (or below) removes the line.
 */
export function cartReducer(state: CartState, action: CartState | CartAction) {
  // allow the provider to hydrate wholesale from storage
  if ("items" in action) return action;

  switch (action.type) {
    case "add": {
      const addQty = clampQty(action.kuantitas ?? 1);
      if (addQty === 0) return state;

      const existing = state.items.find(
        (i) => i.id_produk === action.item.id_produk,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id_produk === action.item.id_produk
              ? { ...i, kuantitas: clampQty(i.kuantitas + addQty) }
              : i,
          ),
        };
      }
      const line: CartItem = { ...action.item, kuantitas: addQty };
      return { items: [...state.items, line] };
    }

    case "setQuantity": {
      const qty = clampQty(action.kuantitas);
      if (qty === 0) {
        return {
          items: state.items.filter((i) => i.id_produk !== action.id_produk),
        };
      }
      return {
        items: state.items.map((i) =>
          i.id_produk === action.id_produk ? { ...i, kuantitas: qty } : i,
        ),
      };
    }

    case "remove":
      return {
        items: state.items.filter((i) => i.id_produk !== action.id_produk),
      };

    case "clear":
      return { items: [] };

    default:
      return state;
  }
}

/* ---- selectors ---------------------------------------------------------- */

export function selectLineSubtotal(item: CartItem): number {
  return item.harga * item.kuantitas;
}

export function selectSubtotal(state: CartState): number {
  return state.items.reduce((sum, i) => sum + selectLineSubtotal(i), 0);
}

/** Total number of drinks/snacks in the cart. */
export function selectItemCount(state: CartState): number {
  return state.items.reduce((sum, i) => sum + i.kuantitas, 0);
}

export function selectQuantityOf(state: CartState, id_produk: number): number {
  return state.items.find((i) => i.id_produk === id_produk)?.kuantitas ?? 0;
}
