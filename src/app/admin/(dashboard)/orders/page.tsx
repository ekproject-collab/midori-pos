import { OrderQueueBoard } from "@/components/admin/OrderQueueBoard";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Order Queue</h1>
      <OrderQueueBoard />
    </div>
  );
}
