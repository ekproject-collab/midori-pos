"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import {
  cartReducer,
  selectItemCount,
  selectQuantityOf,
  selectSubtotal,
} from "@/lib/cart/reducer";
import { emptyCart, type CartItem, type CartState } from "@/lib/cart/types";

const STORAGE_KEY = "midori-cart-v1";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  quantityOf: (id_produk: number) => number;
  add: (item: Omit<CartItem, "kuantitas">, kuantitas?: number) => void;
  setQuantity: (id_produk: number, kuantitas: number) => void;
  remove: (id_produk: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStored(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCart;
    const parsed = JSON.parse(raw) as CartState;
    if (parsed && Array.isArray(parsed.items)) return parsed;
  } catch {
    // ignore — corrupt or unavailable storage
  }
  return emptyCart;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, emptyCart);

  // Hydrate from localStorage after mount. Deliberately deferred to an effect
  // (not a lazy reducer init) so server and first client render both start
  // from an empty cart and no hydration mismatch occurs.
  useEffect(() => {
    const stored = readStored();
    if (stored.items.length > 0) dispatch(stored);
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      itemCount: selectItemCount(state),
      subtotal: selectSubtotal(state),
      quantityOf: (id) => selectQuantityOf(state, id),
      add: (item, kuantitas) => dispatch({ type: "add", item, kuantitas }),
      setQuantity: (id_produk, kuantitas) =>
        dispatch({ type: "setQuantity", id_produk, kuantitas }),
      remove: (id_produk) => dispatch({ type: "remove", id_produk }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [state],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
