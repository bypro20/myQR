import { requireAdminRouteAccess } from "@/lib/tenant";
import { AdminSettingsPanel } from "@/components/admin/admin-settings-panel";

export default async function AdminSettingsPage() {
  await requireAdminRouteAccess("/admin/settings");
  return <AdminSettingsPanel />;
}
