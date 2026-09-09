import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import type { ProdukWithKategori } from "@/types";

import { ProductImage } from "./ProductImage";

export interface ProductCardProps {
  product: ProdukWithKategori;
  /** Slot for the add-to-cart control (wired in Phase 4). */
  action?: React.ReactNode;
}

export function ProductCard({ product, action }: ProductCardProps) {
  const soldOut = !product.is_available;

  return (
    <article
      className={cn(
        "border-border bg-surface flex flex-col overflow-hidden rounded-md border",
        soldOut && "opacity-60",
      )}
    >
      <div className="relative aspect-4/3">
        <ProductImage
          src={product.gambar_url}
          alt={product.nama_produk}
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
        />
        {soldOut && (
          <span className="absolute top-2 right-2">
            <Badge tone="danger">Sold Out</Badge>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="leading-tight font-semibold">{product.nama_produk}</h3>
        {product.deskripsi && (
          <p className="text-muted line-clamp-2 text-xs">{product.deskripsi}</p>
        )}
        <p className="mt-auto pt-2 font-bold tabular-nums">
          {formatRupiah(product.harga)}
        </p>
        {action && <div className="pt-2">{action}</div>}
      </div>
    </article>
  );
}
