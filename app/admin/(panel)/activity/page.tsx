import { AdminActivityPanel } from "@/components/admin/admin-activity-panel";
import { requireAdminRouteAccess } from "@/lib/tenant";

export default async function AdminActivityPage() {
  await requireAdminRouteAccess("/admin/activity");
  return <AdminActivityPanel />;
}
