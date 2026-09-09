import type { MetodePembayaran, TipePesanan } from "@/types";

export interface CheckoutValues {
  nama: string;
  tipe: TipePesanan;
  nomorMeja: string;
  metode: MetodePembayaran;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutValues, string>>;

export const defaultCheckoutValues: CheckoutValues = {
  nama: "",
  tipe: "takeaway",
  nomorMeja: "",
  metode: "cash",
};

/**
 * Pure form validation — mirrors the DB constraints (create_order + the
 * pesanan CHECK) so the customer gets friendly messages before submit.
 */
export function validateCheckout(values: CheckoutValues): CheckoutErrors {
  const errors: CheckoutErrors = {};

  if (values.nama.trim().length === 0) {
    errors.nama = "Nama wajib diisi.";
  }
  if (values.tipe !== "dine_in" && values.tipe !== "takeaway") {
    errors.tipe = "Pilih tipe pesanan.";
  }
  if (values.tipe === "dine_in" && values.nomorMeja.trim().length === 0) {
    errors.nomorMeja = "Nomor meja wajib untuk dine-in.";
  }
  if (values.metode !== "cash" && values.metode !== "qris") {
    errors.metode = "Pilih metode pembayaran.";
  }

  return errors;
}

export function isCheckoutValid(values: CheckoutValues): boolean {
  return Object.keys(validateCheckout(values)).length === 0;
}
