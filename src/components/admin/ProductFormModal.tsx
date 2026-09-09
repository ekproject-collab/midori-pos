"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Button,
  Field,
  Input,
  Modal,
  Select,
  Textarea,
  useToast,
} from "@/components/ui";
import { uploadProductImage } from "@/services/supabase";
import type { Database } from "@/types/database";
import type { Kategori, ProdukWithKategori } from "@/types";

type ProdukInsert = Database["public"]["Tables"]["produk"]["Insert"];
type ProdukUpdate = Database["public"]["Tables"]["produk"]["Update"];

export interface ProductFormModalProps {
  onClose: () => void;
  categories: Kategori[];
  /** null = create mode. */
  product: ProdukWithKategori | null;
  onCreate: (input: ProdukInsert) => Promise<boolean>;
  onEdit: (id: number, patch: ProdukUpdate) => Promise<boolean>;
}

interface FormValues {
  nama_produk: string;
  id_kategori: string;
  deskripsi: string;
  harga: string;
  is_available: boolean;
}

/**
 * Reset-on-open is handled by the parent giving this a `key` and only mounting
 * it while open, so state can be initialised straight from props — no syncing
 * effect.
 */
export function ProductFormModal({
  onClose,
  categories,
  product,
  onCreate,
  onEdit,
}: ProductFormModalProps) {
  const toast = useToast();
  const [values, setValues] = useState<FormValues>(() =>
    product
      ? {
          nama_produk: product.nama_produk,
          id_kategori: String(product.id_kategori),
          deskripsi: product.deskripsi ?? "",
          harga: String(product.harga),
          is_available: product.is_available,
        }
      : {
          nama_produk: "",
          id_kategori: String(categories[0]?.id_kategori ?? ""),
          deskripsi: "",
          harga: "",
          is_available: true,
        },
  );
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const filePreview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const set = <K extends keyof FormValues>(k: K, v: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    const nama = values.nama_produk.trim();
    const harga = Number(values.harga);
    const idKategori = Number(values.id_kategori);

    if (!nama) {
      toast.show("Nama produk wajib diisi.", "danger");
      return;
    }
    if (!idKategori) {
      toast.show("Pilih kategori.", "danger");
      return;
    }
    if (!Number.isFinite(harga) || harga < 0) {
      toast.show("Harga tidak valid.", "danger");
      return;
    }

    setBusy(true);

    let gambarUrl: string | undefined;
    if (file) {
      const up = await uploadProductImage(file);
      if (up.error !== null) {
        setBusy(false);
        toast.show(up.error, "danger");
        return;
      }
      gambarUrl = up.data;
    }

    const deskripsi = values.deskripsi.trim() || null;

    const done = product
      ? await onEdit(product.id_produk, {
          nama_produk: nama,
          id_kategori: idKategori,
          deskripsi,
          harga,
          is_available: values.is_available,
          ...(gambarUrl ? { gambar_url: gambarUrl } : {}),
        })
      : await onCreate({
          nama_produk: nama,
          id_kategori: idKategori,
          deskripsi,
          harga,
          is_available: values.is_available,
          gambar_url: gambarUrl ?? null,
        });

    setBusy(false);
    if (done) onClose();
  };

  const previewUrl = filePreview ?? product?.gambar_url ?? null;

  return (
    <Modal
      open
      onClose={onClose}
      title={product ? "Edit Produk" : "Tambah Produk"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={busy}>
            {busy ? "Menyimpan…" : "Simpan"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nama produk" required htmlFor="p-nama">
          <Input
            id="p-nama"
            value={values.nama_produk}
            onChange={(e) => set("nama_produk", e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Kategori" required htmlFor="p-kat">
            <Select
              id="p-kat"
              value={values.id_kategori}
              onChange={(e) => set("id_kategori", e.target.value)}
            >
              <option value="">— pilih —</option>
              {categories.map((c) => (
                <option key={c.id_kategori} value={c.id_kategori}>
                  {c.nama_kategori}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Harga (Rp)" required htmlFor="p-harga">
            <Input
              id="p-harga"
              type="number"
              min={0}
              step={500}
              value={values.harga}
              onChange={(e) => set("harga", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Deskripsi" htmlFor="p-desc">
          <Textarea
            id="p-desc"
            rows={2}
            value={values.deskripsi}
            onChange={(e) => set("deskripsi", e.target.value)}
          />
        </Field>

        <Field
          label="Gambar"
          hint="JPG / PNG / WebP, maks 2 MB"
          htmlFor="p-img"
        >
          <div className="flex items-center gap-3">
            <div className="border-border bg-matcha-50 relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border">
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <input
              id="p-img"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>
        </Field>

        <label className="text-ink-700 flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={values.is_available}
            onChange={(e) => set("is_available", e.target.checked)}
          />
          Tersedia (tampil di kiosk)
        </label>
      </div>
    </Modal>
  );
}
