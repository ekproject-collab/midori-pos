import { ProductManager } from "@/components/admin/ProductManager";

export default function AdminProductsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Produk &amp; Kategori</h1>
      <ProductManager />
    </div>
  );
}
