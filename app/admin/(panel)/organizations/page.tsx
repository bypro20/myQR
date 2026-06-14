import { requireAdminRouteAccess, userHasPermission } from "@/lib/tenant";
import { AdminOrganizationsPanel } from "@/components/admin/admin-organizations-panel";

export default async function AdminOrganizationsPage() {
  const { user } = await requireAdminRouteAccess("/admin/organizations");
  return (
    <AdminOrganizationsPanel
      canManage={userHasPermission(user, "organizations_manage")}
    />
  );
}
