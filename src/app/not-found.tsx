import Link from "next/link";

import { buttonClass } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-4xl" aria-hidden>
        茶
      </p>
      <h1 className="text-2xl font-bold">Halaman tidak ditemukan</h1>
      <p className="text-muted">Tautan yang kamu buka tidak tersedia.</p>
      <Link href="/" className={buttonClass()}>
        Ke Beranda
      </Link>
    </main>
  );
}
