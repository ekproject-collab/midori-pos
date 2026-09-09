import Link from "next/link";

import { Card, CardBody, CardHeader } from "@/components/ui";

const MODULES = [
  {
    href: "/admin/orders",
    title: "Order Queue",
    desc: "Pantau pesanan masuk & ubah status (Fase 7).",
  },
  {
    href: "/admin/products",
    title: "Produk & Kategori",
    desc: "Kelola katalog, harga, dan status Sold Out (Fase 8).",
  },
  {
    href: "/admin/reports",
    title: "Laporan / Close Order",
    desc: "Rekap harian & tutup buku (Fase 9).",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <Link key={m.href} href={m.href}>
            <Card
              raised
              className="hover:bg-cream-100 h-full p-5 transition-colors"
            >
              <p className="font-semibold">{m.title}</p>
              <p className="text-muted mt-1 text-sm">{m.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>Status</CardHeader>
        <CardBody className="text-muted text-sm">
          Kamu masuk sebagai admin. Modul dashboard menyusul di Fase 7–9.
        </CardBody>
      </Card>
    </div>
  );
}
