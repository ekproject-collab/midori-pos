/**
 * Supabase schema types — hand-maintained to match `supabase/migrations/`.
 * Replace with generated output once the Supabase CLI is set up:
 *   supabase gen types typescript --project-id <your-project-ref> > src/types/database.ts
 */

export type TipePesanan = "dine_in" | "takeaway";
export type MetodePembayaran = "cash" | "qris";
export type StatusPembayaran = "unpaid" | "paid";
export type StatusPesanan = "new" | "preparing" | "done";

export interface Database {
  public: {
    Tables: {
      kategori: {
        Row: {
          id_kategori: number;
          nama_kategori: string;
          created_at: string;
        };
        Insert: {
          id_kategori?: never;
          nama_kategori: string;
          created_at?: string;
        };
        Update: {
          nama_kategori?: string;
        };
        Relationships: [];
      };
      produk: {
        Row: {
          id_produk: number;
          id_kategori: number;
          nama_produk: string;
          deskripsi: string | null;
          harga: number;
          gambar_url: string | null;
          is_available: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id_produk?: never;
          id_kategori: number;
          nama_produk: string;
          deskripsi?: string | null;
          harga: number;
          gambar_url?: string | null;
          is_available?: boolean;
          deleted_at?: string | null;
        };
        Update: {
          id_kategori?: number;
          nama_produk?: string;
          deskripsi?: string | null;
          harga?: number;
          gambar_url?: string | null;
          is_available?: boolean;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "produk_id_kategori_fkey";
            columns: ["id_kategori"];
            referencedRelation: "kategori";
            referencedColumns: ["id_kategori"];
          },
        ];
      };
      pesanan: {
        Row: {
          id_pesanan: number;
          nama_pelanggan: string;
          tipe_pesanan: TipePesanan;
          nomor_meja: string | null;
          metode_pembayaran: MetodePembayaran;
          status_pembayaran: StatusPembayaran;
          status_pesanan: StatusPesanan;
          total_harga: number;
          waktu_pesanan: string;
        };
        Insert: {
          id_pesanan?: never;
          nama_pelanggan: string;
          tipe_pesanan: TipePesanan;
          nomor_meja?: string | null;
          metode_pembayaran: MetodePembayaran;
          status_pembayaran?: StatusPembayaran;
          status_pesanan?: StatusPesanan;
          total_harga: number;
          waktu_pesanan?: string;
        };
        Update: {
          status_pembayaran?: StatusPembayaran;
          status_pesanan?: StatusPesanan;
        };
        Relationships: [];
      };
      detail_pesanan: {
        Row: {
          id_detail: number;
          id_pesanan: number;
          id_produk: number;
          kuantitas: number;
          harga_satuan: number;
          subtotal: number;
        };
        Insert: {
          id_detail?: never;
          id_pesanan: number;
          id_produk: number;
          kuantitas: number;
          harga_satuan: number;
          subtotal: number;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "detail_pesanan_id_pesanan_fkey";
            columns: ["id_pesanan"];
            referencedRelation: "pesanan";
            referencedColumns: ["id_pesanan"];
          },
          {
            foreignKeyName: "detail_pesanan_id_produk_fkey";
            columns: ["id_produk"];
            referencedRelation: "produk";
            referencedColumns: ["id_produk"];
          },
        ];
      };
      rekap_harian: {
        Row: {
          id_rekap: number;
          tanggal: string;
          total_transaksi: number;
          total_pendapatan_cash: number;
          total_pendapatan_qris: number;
          total_pendapatan_keseluruhan: number;
          waktu_tutup: string;
        };
        Insert: {
          id_rekap?: never;
          tanggal: string;
          total_transaksi?: number;
          total_pendapatan_cash?: number;
          total_pendapatan_qris?: number;
          total_pendapatan_keseluruhan?: number;
          waktu_tutup?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_order: {
        Args: {
          p_nama_pelanggan: string;
          p_tipe_pesanan: TipePesanan;
          p_nomor_meja: string | null;
          p_metode_pembayaran: MetodePembayaran;
          p_items: { id_produk: number; kuantitas: number }[];
        };
        Returns: Database["public"]["Tables"]["pesanan"]["Row"];
      };
      get_daily_sales: {
        Args: { p_tanggal?: string };
        Returns: {
          tanggal: string;
          total_transaksi: number;
          total_pendapatan_cash: number;
          total_pendapatan_qris: number;
          total_pendapatan_keseluruhan: number;
          sudah_ditutup: boolean;
        }[];
      };
      close_daily_recap: {
        Args: { p_tanggal?: string };
        Returns: Database["public"]["Tables"]["rekap_harian"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
