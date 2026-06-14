import { requireAdminRouteAccess } from "@/lib/tenant";
import { AdminOverview } from "@/components/admin/admin-overview";

export default async function AdminPage() {
  await requireAdminRouteAccess("/admin");
  return <AdminOverview />;
}
