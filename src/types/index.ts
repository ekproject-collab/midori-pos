import type { Database } from "./database";

export type {
  TipePesanan,
  MetodePembayaran,
  StatusPembayaran,
  StatusPesanan,
} from "./database";

type Tables = Database["public"]["Tables"];

export type Kategori = Tables["kategori"]["Row"];
export type Produk = Tables["produk"]["Row"];
export type Pesanan = Tables["pesanan"]["Row"];
export type DetailPesanan = Tables["detail_pesanan"]["Row"];
export type RekapHarian = Tables["rekap_harian"]["Row"];

/** Produk with its parent category joined in. */
export type ProdukWithKategori = Produk & { kategori: Kategori | null };

/** A pesanan with its line items (and each line's product) joined in. */
export type PesananWithDetail = Pesanan & {
  detail_pesanan: (DetailPesanan & { produk: Produk | null })[];
};

/** One cart line as sent to the create_order RPC. */
export interface OrderItemInput {
  id_produk: number;
  kuantitas: number;
}

/** Live (pre-close) sales figures for a shop-day. */
export type DailySales =
  Database["public"]["Functions"]["get_daily_sales"]["Returns"][number];
