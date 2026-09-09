"use client";

import { Button, QuantityStepper } from "@/components/ui";
import type { ProdukWithKategori } from "@/types";

import { useCart } from "./CartProvider";

/**
 * Product-card control: a "Tambah" button until the item is in the cart, then
 * a stepper. Disabled entirely when the product is Sold Out.
 */
export function AddToCartControl({ product }: { product: ProdukWithKategori }) {
  const { quantityOf, add, setQuantity } = useCart();
  const qty = quantityOf(product.id_produk);

  if (!product.is_available) {
    return (
      <Button size="sm" block disabled>
        Sold Out
      </Button>
    );
  }

  if (qty === 0) {
    return (
      <Button
        size="sm"
        block
        onClick={() =>
          add({
            id_produk: product.id_produk,
            nama_produk: product.nama_produk,
            harga: product.harga,
            gambar_url: product.gambar_url,
          })
        }
      >
        Tambah
      </Button>
    );
  }

  return (
    <QuantityStepper
      value={qty}
      min={0}
      onChange={(next) => setQuantity(product.id_produk, next)}
      className="w-full justify-between"
      aria-label={`Kuantitas ${product.nama_produk}`}
    />
  );
}
