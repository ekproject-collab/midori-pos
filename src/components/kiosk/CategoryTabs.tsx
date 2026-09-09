"use client";

import { cn } from "@/lib/cn";
import type { Kategori } from "@/types";

export interface CategoryTabsProps {
  categories: Kategori[];
  activeId: number | null;
  onSelect: (id: number) => void;
}

export function CategoryTabs({
  categories,
  activeId,
  onSelect,
}: CategoryTabsProps) {
  return (
    <div
      className="border-border -mb-px flex gap-1 overflow-x-auto border-b"
      role="tablist"
      aria-label="Kategori menu"
    >
      {categories.map((category) => {
        const active = category.id_kategori === activeId;
        return (
          <button
            key={category.id_kategori}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(category.id_kategori)}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap",
              active
                ? "border-matcha-600 text-matcha-800"
                : "text-muted hover:text-ink-900 border-transparent",
            )}
          >
            {category.nama_kategori}
          </button>
        );
      })}
    </div>
  );
}
