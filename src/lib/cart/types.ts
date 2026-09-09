/** One line in the kiosk cart. `harga` is a display snapshot — the server
 * re-prices every line from the live catalog when the order is created. */
export interface CartItem {
  id_produk: number;
  nama_produk: string;
  harga: number;
  gambar_url: string | null;
  kuantitas: number;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: "add"; item: Omit<CartItem, "kuantitas">; kuantitas?: number }
  | { type: "setQuantity"; id_produk: number; kuantitas: number }
  | { type: "remove"; id_produk: number }
  | { type: "clear" };

export const emptyCart: CartState = { items: [] };
