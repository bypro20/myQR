import { NextResponse } from "next/server";
import { getUserAdminPermissions, hasAdminPanelAccess } from "@/lib/admin-permissions";
import { requirePlatformAdminApi } from "@/lib/tenant";

export async function GET() {
  const auth = await requirePlatformAdminApi();
  if (auth.error) return auth.error;

  return NextResponse.json({
    user: {
      id: auth.user.id,
      email: auth.user.email,
      name: auth.user.name,
      role: auth.user.role,
    },
    permissions: getUserAdminPermissions(auth.user),
    hasAdminPanelAccess: hasAdminPanelAccess(auth.user),
    isSuperAdmin: auth.user.role === "SUPER_ADMIN",
  });
}
