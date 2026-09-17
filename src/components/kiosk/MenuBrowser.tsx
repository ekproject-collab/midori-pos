"use client";

import { useState, type ReactNode } from "react";

import { AddToCartControl } from "@/components/cart/AddToCartControl";
import { useCatalog } from "@/hooks/useCatalog";
import { Button, EmptyState } from "@/components/ui";
import { Skeleton } from "@/components/ui";

import { CategoryTabs } from "./CategoryTabs";
import { ProductCard } from "./ProductCard";

const GRID = "grid grid-cols-2 gap-4 lg:grid-cols-3";

/**
 * Sticks the page title + category tabs to the top of the viewport on
 * scroll. The negative margin/padding pair cancels KioskShell's `<main>`
 * padding (p-8) and re-applies it locally, so the bar looks identical to the
 * rest of the page while unstuck but keeps a solid background (no gradient/
 * blur, per AGENTS.md) once it sticks — otherwise the kiosk background image
 * would show through and the tabs became unreadable.
 */
const STICKY_HEADER =
  "bg-background sticky top-0 z-10 -mx-8 -mt-8 space-y-4 px-8 pt-8 pb-4";

export interface MenuBrowserProps {
  /** Page title / nav, rendered inside the sticky header above the tabs. */
  header?: ReactNode;
}

function LoadingGrid({ header }: { header?: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className={STICKY_HEADER}>
        {header}
        <Skeleton className="h-12 w-72" />
      </div>
      <div className={GRID}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full" />
        ))}
      </div>
    </div>
  );
}

export function MenuBrowser({ header }: MenuBrowserProps) {
  const { categories, productsByCategory, loading, error, refetch } =
    useCatalog();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (loading) return <LoadingGrid header={header} />;

  if (error) {
    return (
      <div className="space-y-5">
        <div className={STICKY_HEADER}>{header}</div>
        <EmptyState
          title="Gagal memuat menu"
          description={error}
          icon="⚠️"
          action={<Button onClick={refetch}>Coba lagi</Button>}
        />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="space-y-5">
        <div className={STICKY_HEADER}>{header}</div>
        <EmptyState
          title="Menu belum tersedia"
          description="Belum ada kategori yang ditambahkan admin."
          icon="🍵"
        />
      </div>
    );
  }

  const activeId = selectedId ?? categories[0].id_kategori;
  const products = productsByCategory.get(activeId) ?? [];

  return (
    <div className="space-y-5">
      <div className={STICKY_HEADER}>
        {header}
        <CategoryTabs
          categories={categories}
          activeId={activeId}
          onSelect={setSelectedId}
        />
      </div>

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
