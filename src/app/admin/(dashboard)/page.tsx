import Link from "next/link";

import { DashboardSummary } from "@/components/admin/DashboardSummary";
import { Card } from "@/components/ui";

const MODULES = [
  {
    href: "/admin/orders",
    title: "Order Queue",
    desc: "Pantau pesanan masuk secara real-time & ubah statusnya.",
  },
  {
    href: "/admin/products",
    title: "Produk & Kategori",
    desc: "Kelola katalog, harga, gambar, dan status Sold Out.",
  },
  {
    href: "/admin/reports",
    title: "Laporan / Close Order",
    desc: "Rekap penjualan harian & tutup buku.",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <section className="space-y-3">
        <h2 className="text-muted text-sm font-semibold tracking-wide uppercase">
          Ringkasan Hari Ini
        </h2>
        <DashboardSummary />
      </section>

      <section className="space-y-3">
        <h2 className="text-muted text-sm font-semibold tracking-wide uppercase">
          Modul
        </h2>
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
      </section>
    </div>
  );
}
