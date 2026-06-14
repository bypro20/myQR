import { requireAdminRouteAccess } from "@/lib/tenant";
import { AdminQrCodesPanel } from "@/components/admin/admin-qr-codes-panel";

export default async function AdminQrCodesPage() {
  await requireAdminRouteAccess("/admin/qr-codes");
  return <AdminQrCodesPanel />;
}
