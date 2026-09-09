"use client";

import { useMemo, useState } from "react";

import { useAdminCatalog } from "@/hooks/useAdminCatalog";
import { ProductImage } from "@/components/kiosk/ProductImage";
import { Badge, Button, EmptyState, Modal, Skeleton } from "@/components/ui";
import { formatRupiah } from "@/lib/format";
import type { ProdukWithKategori } from "@/types";

import { CategoryPanel } from "./CategoryPanel";
import { ProductFormModal } from "./ProductFormModal";

export function ProductManager() {
  const catalog = useAdminCatalog();
  const {
    categories,
    products,
    loading,
    error,
    refetch,
    toggleAvailability,
    removeProduct,
  } = catalog;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProdukWithKategori | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProdukWithKategori | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const countByCategory = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of products) {
      map.set(p.id_kategori, (map.get(p.id_kategori) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p: ProdukWithKategori) => {
    setEditing(p);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await removeProduct(deleteTarget.id_produk);
    setDeleting(false);
    setDeleteTarget(null);
  };

  if (loading) return <Skeleton className="h-96 w-full" />;

  if (error) {
    return (
      <EmptyState
        title="Gagal memuat katalog"
        description={error}
        icon="⚠️"
        action={<Button onClick={refetch}>Coba lagi</Button>}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Produk ({products.length})</h2>
          <Button onClick={openCreate}>+ Tambah Produk</Button>
        </div>

        {products.length === 0 ? (
          <EmptyState title="Belum ada produk" icon="🍵" />
        ) : (
          <div className="border-border overflow-x-auto rounded-md border">
            <table className="w-full min-w-xl text-sm">
              <thead className="border-border bg-cream-100 border-b text-left">
                <tr>
                  <th className="p-2 font-semibold">Produk</th>
                  <th className="p-2 font-semibold">Kategori</th>
                  <th className="p-2 text-right font-semibold">Harga</th>
                  <th className="p-2 font-semibold">Status</th>
                  <th className="p-2 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {products.map((p) => (
                  <tr key={p.id_produk}>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className="border-border relative h-9 w-9 shrink-0 overflow-hidden rounded-sm border">
                          <ProductImage
                            src={p.gambar_url}
                            alt={p.nama_produk}
                            sizes="36px"
                          />
                        </div>
                        <span className="font-medium">{p.nama_produk}</span>
                      </div>
                    </td>
                    <td className="text-muted p-2">
                      {p.kategori?.nama_kategori ?? "—"}
                    </td>
                    <td className="p-2 text-right tabular-nums">
                      {formatRupiah(p.harga)}
                    </td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() =>
                          toggleAvailability(p.id_produk, !p.is_available)
                        }
                        title="Klik untuk ubah"
                      >
                        <Badge tone={p.is_available ? "success" : "danger"}>
                          {p.is_available ? "Tersedia" : "Sold Out"}
                        </Badge>
                      </button>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="text-ink-700 text-xs underline"
                          onClick={() => openEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-danger-700 text-xs underline"
                          onClick={() => setDeleteTarget(p)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CategoryPanel
        categories={categories}
        productCountByCategory={countByCategory}
        onAdd={catalog.addCategory}
        onRename={catalog.renameCategory}
        onRemove={catalog.removeCategory}
      />

      {formOpen && (
        <ProductFormModal
          key={editing?.id_produk ?? "new"}
          onClose={() => setFormOpen(false)}
          categories={categories}
          product={editing}
          onCreate={catalog.addProduct}
          onEdit={catalog.editProduct}
        />
      )}

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Hapus produk?"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Menghapus…" : "Hapus"}
            </Button>
          </>
        }
      >
        <p className="text-muted text-sm">
          <span className="text-ink-900 font-semibold">
            {deleteTarget?.nama_produk}
          </span>{" "}
          akan disembunyikan dari kiosk. Riwayat pesanan lama tetap utuh.
        </p>
      </Modal>
    </div>
  );
}
