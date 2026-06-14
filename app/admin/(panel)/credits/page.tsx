import { Suspense } from "react";
import { requireAdminRouteAccess } from "@/lib/tenant";
import { AdminCreditsPanel } from "@/components/admin/admin-credits-panel";

function CreditsFallback() {
  return <p className="text-[var(--ink-muted)]">Yükleniyor…</p>;
}

export default async function AdminCreditsPage() {
  await requireAdminRouteAccess("/admin/credits");
  return (
    <Suspense fallback={<CreditsFallback />}>
      <AdminCreditsPanel />
    </Suspense>
  );
}
