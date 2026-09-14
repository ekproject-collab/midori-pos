"use client";

import { useState } from "react";

import { AddToCartControl } from "@/components/cart/AddToCartControl";
import { useCatalog } from "@/hooks/useCatalog";
import { Button, EmptyState } from "@/components/ui";
import { Skeleton } from "@/components/ui";

import { CategoryTabs } from "./CategoryTabs";
import { ProductCard } from "./ProductCard";

const GRID = "grid grid-cols-2 gap-4 lg:grid-cols-3";

function LoadingGrid() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-72" />
      <div className={GRID}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full" />
        ))}
      </div>
    </div>
  );
}

export function MenuBrowser() {
  const { categories, productsByCategory, loading, error, refetch } =
    useCatalog();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (loading) return <LoadingGrid />;

  if (error) {
    return (
      <EmptyState
        title="Gagal memuat menu"
        description={error}
        icon="⚠️"
        action={<Button onClick={refetch}>Coba lagi</Button>}
      />
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        title="Menu belum tersedia"
        description="Belum ada kategori yang ditambahkan admin."
        icon="🍵"
      />
    );
  }

  const activeId = selectedId ?? categories[0].id_kategori;
  const products = productsByCategory.get(activeId) ?? [];

  return (
    <div className="space-y-5">
      <CategoryTabs
        categories={categories}
        activeId={activeId}
        onSelect={setSelectedId}
      />

      {products.length === 0 ? (
        <EmptyState title="Belum ada produk di kategori ini" icon="🍵" />
      ) : (
        <div className={GRID}>
          {products.map((product) => (
            <ProductCard
              key={product.id_produk}
              product={product}
              action={<AddToCartControl product={product} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}
