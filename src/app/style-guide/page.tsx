"use client";

import { useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Field,
  Input,
  Modal,
  QuantityStepper,
  Select,
  Skeleton,
  Spinner,
  useToast,
} from "@/components/ui";
import { formatRupiah } from "@/lib/format";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="border-border text-muted border-b pb-1 text-sm font-bold tracking-wide uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

// Full literal class strings — Tailwind only generates classes it can see as
// complete tokens in source (no runtime string building).
const SWATCHES: { name: string; bg: string }[][] = [
  [
    { name: "matcha-100", bg: "bg-matcha-100" },
    { name: "matcha-300", bg: "bg-matcha-300" },
    { name: "matcha-500", bg: "bg-matcha-500" },
    { name: "matcha-600", bg: "bg-matcha-600" },
    { name: "matcha-700", bg: "bg-matcha-700" },
    { name: "matcha-900", bg: "bg-matcha-900" },
  ],
  [
    { name: "coffee-100", bg: "bg-coffee-100" },
    { name: "coffee-300", bg: "bg-coffee-300" },
    { name: "coffee-500", bg: "bg-coffee-500" },
    { name: "coffee-600", bg: "bg-coffee-600" },
    { name: "coffee-700", bg: "bg-coffee-700" },
    { name: "coffee-900", bg: "bg-coffee-900" },
  ],
  [
    { name: "cream-50", bg: "bg-cream-50" },
    { name: "cream-100", bg: "bg-cream-100" },
    { name: "cream-200", bg: "bg-cream-200" },
    { name: "cream-300", bg: "bg-cream-300" },
  ],
];

export default function StyleGuidePage() {
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [modal, setModal] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-10 p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Midori POS — Style Guide</h1>
        <p className="text-muted text-sm">
          Fase 2 design system. Flat, no gradients, no glassmorphism.
        </p>
      </header>

      <Section title="Warna">
        <div className="space-y-3">
          {SWATCHES.map((row) => (
            <div key={row[0].name} className="flex flex-wrap gap-2">
              {row.map((s) => (
                <div key={s.name} className="text-center">
                  <div
                    className={`border-border h-12 w-16 rounded-sm border ${s.bg}`}
                  />
                  <span className="text-muted text-[10px]">{s.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografi">
        <div className="space-y-1">
          <p className="text-3xl font-bold">Aa — Judul besar</p>
          <p className="text-xl font-semibold">Aa — Subjudul</p>
          <p className="text-base">Aa — Body text untuk kiosk.</p>
          <p className="text-muted text-sm">Aa — Keterangan / muted.</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatRupiah(28000)}
          </p>
        </div>
      </Section>

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">New</Badge>
          <Badge tone="matcha">Matcha</Badge>
          <Badge tone="success">Paid</Badge>
          <Badge tone="warning">Preparing</Badge>
          <Badge tone="danger">Sold Out</Badge>
          <Badge tone="info">Dine-in</Badge>
        </div>
      </Section>

      <Section title="Card">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>Card biasa</CardHeader>
            <CardBody className="text-muted text-sm">
              Border solid, tanpa shadow.
            </CardBody>
          </Card>
          <Card raised>
            <CardHeader>Card raised</CardHeader>
            <CardBody className="text-muted text-sm">
              Hard shadow (offset, tanpa blur).
            </CardBody>
          </Card>
        </div>
      </Section>

      <Section title="Form fields">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama" required htmlFor="sg-nama">
            <Input id="sg-nama" placeholder="Nama pelanggan" />
          </Field>
          <Field label="Tipe Pesanan" htmlFor="sg-tipe">
            <Select id="sg-tipe">
              <option>Dine-in</option>
              <option>Takeaway</option>
            </Select>
          </Field>
          <Field label="Nomor Meja" error="Wajib diisi untuk dine-in">
            <Input invalid placeholder="mis. 4" />
          </Field>
        </div>
      </Section>

      <Section title="Quantity stepper">
        <div className="flex items-center gap-4">
          <QuantityStepper value={qty} onChange={setQty} min={1} />
          <QuantityStepper value={qty} onChange={setQty} min={1} size="lg" />
        </div>
      </Section>

      <Section title="Loading">
        <div className="flex items-center gap-4">
          <Spinner />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Section>

      <Section title="Empty state">
        <EmptyState
          title="Belum ada pesanan"
          description="Pesanan yang masuk dari kiosk akan muncul di sini."
          icon="🍵"
          action={<Button size="sm">Segarkan</Button>}
        />
      </Section>

      <Section title="Overlay & feedback">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setModal(true)}>Buka Modal</Button>
          <Button
            variant="secondary"
            onClick={() => toast.show("Pesanan tersimpan.", "success")}
          >
            Toast sukses
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.show("Gagal menyimpan.", "danger")}
          >
            Toast error
          </Button>
        </div>
        <Modal
          open={modal}
          onClose={() => setModal(false)}
          title="Konfirmasi"
          footer={
            <>
              <Button variant="ghost" onClick={() => setModal(false)}>
                Batal
              </Button>
              <Button onClick={() => setModal(false)}>Ya, lanjutkan</Button>
            </>
          }
        >
          <p className="text-muted text-sm">
            Scrim solid (ink 60%), panel opaque, hard shadow. Tidak ada blur.
          </p>
        </Modal>
      </Section>
    </div>
  );
}
