"use client";

import { useState } from "react";

import { Button, Card, CardBody, CardHeader, Input } from "@/components/ui";
import type { Kategori } from "@/types";

export interface CategoryPanelProps {
  categories: Kategori[];
  productCountByCategory: Map<number, number>;
  onAdd: (nama: string) => Promise<boolean>;
  onRename: (id: number, nama: string) => Promise<boolean>;
  onRemove: (id: number) => Promise<boolean>;
}

export function CategoryPanel({
  categories,
  productCountByCategory,
  onAdd,
  onRename,
  onRemove,
}: CategoryPanelProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);

  const handleAdd = async () => {
    if (!newName.trim() || busy) return;
    setBusy(true);
    const ok = await onAdd(newName.trim());
    setBusy(false);
    if (ok) setNewName("");
  };

  const handleRename = async (id: number) => {
    if (!editName.trim() || busy) return;
    setBusy(true);
    const ok = await onRename(id, editName.trim());
    setBusy(false);
    if (ok) setEditingId(null);
  };

  return (
    <Card>
      <CardHeader>Kategori</CardHeader>
      <CardBody className="space-y-3">
        <ul className="divide-border divide-y">
          {categories.map((c) => {
            const count = productCountByCategory.get(c.id_kategori) ?? 0;
            const editing = editingId === c.id_kategori;
            return (
              <li key={c.id_kategori} className="flex items-center gap-2 py-2">
                {editing ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 py-1"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleRename(c.id_kategori)}
                      disabled={busy}
                    >
                      Simpan
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Batal
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium">
                      {c.nama_kategori}
                    </span>
                    <span className="text-muted text-xs tabular-nums">
                      {count} produk
                    </span>
                    <button
                      type="button"
                      className="text-ink-700 text-xs underline"
                      onClick={() => {
                        setEditingId(c.id_kategori);
                        setEditName(c.nama_kategori);
                      }}
                    >
                      Ubah
                    </button>
                    <button
                      type="button"
                      className="text-danger-700 text-xs underline disabled:opacity-40"
                      disabled={count > 0}
                      title={
                        count > 0
                          ? "Masih ada produk di kategori ini"
                          : undefined
                      }
                      onClick={() => onRemove(c.id_kategori)}
                    >
                      Hapus
                    </button>
                  </>
                )}
              </li>
            );
          })}
          {categories.length === 0 && (
            <li className="text-muted py-2 text-sm">Belum ada kategori.</li>
          )}
        </ul>

        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Kategori baru"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={busy || !newName.trim()}>
            Tambah
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
