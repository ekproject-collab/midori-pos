"use client";

import { useMemo, useState, type FormEvent } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { Button, Field, Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  defaultCheckoutValues,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutValues,
} from "@/lib/checkout/validate";
import { formatRupiah } from "@/lib/format";
import type { MetodePembayaran, TipePesanan } from "@/types";

export interface CheckoutFormProps {
  onSubmit: (values: CheckoutValues) => void | Promise<void>;
  submitting?: boolean;
}

const TIPE_OPTIONS: { value: TipePesanan; label: string }[] = [
  { value: "takeaway", label: "Takeaway" },
  { value: "dine_in", label: "Dine-in" },
];

const METODE_OPTIONS: { value: MetodePembayaran; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "qris", label: "QRIS" },
];

function OptionGroup<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="space-y-1">
      <legend className="text-ink-700 text-sm font-semibold">{legend}</legend>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-md border px-4 py-2 text-sm font-semibold",
              value === opt.value
                ? "border-matcha-700 bg-matcha-600 text-white"
                : "border-border bg-surface text-ink-900 hover:bg-cream-100",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function CheckoutForm({
  onSubmit,
  submitting = false,
}: CheckoutFormProps) {
  const { subtotal, itemCount } = useCart();
  const [values, setValues] = useState<CheckoutValues>(defaultCheckoutValues);
  const [touched, setTouched] = useState(false);

  const errors: CheckoutErrors = useMemo(
    () => validateCheckout(values),
    [values],
  );
  const showError = (field: keyof CheckoutValues) =>
    touched ? errors[field] : undefined;

  const set = <K extends keyof CheckoutValues>(key: K, v: CheckoutValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    void onSubmit({ ...values, nama: values.nama.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Field label="Nama" required htmlFor="nama" error={showError("nama")}>
        <Input
          id="nama"
          value={values.nama}
          onChange={(e) => set("nama", e.target.value)}
          placeholder="Nama untuk dipanggil"
          invalid={Boolean(showError("nama"))}
          autoComplete="off"
        />
      </Field>

      <OptionGroup
        legend="Tipe Pesanan"
        value={values.tipe}
        options={TIPE_OPTIONS}
        onChange={(v) => set("tipe", v)}
      />

      {values.tipe === "dine_in" && (
        <Field
          label="Nomor Meja"
          required
          htmlFor="meja"
          error={showError("nomorMeja")}
        >
          <Input
            id="meja"
            value={values.nomorMeja}
            onChange={(e) => set("nomorMeja", e.target.value)}
            placeholder="mis. 4"
            inputMode="numeric"
            invalid={Boolean(showError("nomorMeja"))}
          />
        </Field>
      )}

      <OptionGroup
        legend="Metode Pembayaran"
        value={values.metode}
        options={METODE_OPTIONS}
        onChange={(v) => set("metode", v)}
      />

      <div className="border-border flex items-center justify-between border-t pt-4 text-lg">
        <span className="font-semibold">Total ({itemCount} item)</span>
        <span className="font-bold tabular-nums">{formatRupiah(subtotal)}</span>
      </div>

      <Button type="submit" size="lg" block disabled={submitting}>
        {submitting ? "Memproses…" : "Buat Pesanan"}
      </Button>
    </form>
  );
}
