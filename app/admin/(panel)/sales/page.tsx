import { requireAdminRouteAccess } from "@/lib/tenant";
import { AdminSalesPanel } from "@/components/admin/admin-sales-panel";

export default async function AdminSalesPage() {
  await requireAdminRouteAccess("/admin/sales");
  return <AdminSalesPanel />;
}
