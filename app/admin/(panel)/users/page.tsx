import { requireAdminRouteAccess, userHasPermission } from "@/lib/tenant";
import { AdminUsersPanel } from "@/components/admin/admin-users-panel";

export default async function AdminUsersPage() {
  const { user } = await requireAdminRouteAccess("/admin/users");
  return (
    <AdminUsersPanel
      canManage={userHasPermission(user, "users_manage")}
      canView={userHasPermission(user, "users_view") || userHasPermission(user, "users_manage")}
      canManageCredits={
        userHasPermission(user, "credits_manage") || userHasPermission(user, "organizations_manage")
      }
    />
  );
}
