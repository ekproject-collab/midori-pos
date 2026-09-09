import { AdminShell } from "@/components/layout/AdminShell";
import { SupabaseStatus } from "@/components/SupabaseStatus";
import { Card, CardBody, CardHeader } from "@/components/ui";

export default function AdminHomePage() {
  return (
    <AdminShell title="Dashboard">
      <div className="space-y-4">
        <Card>
          <CardHeader>Status</CardHeader>
          <CardBody className="space-y-3">
            <SupabaseStatus />
            <p className="text-muted text-sm">
              Placeholder — autentikasi &amp; modul dashboard dibangun di Fase
              6–9. Route ini belum diproteksi.
            </p>
          </CardBody>
        </Card>
      </div>
    </AdminShell>
  );
}
