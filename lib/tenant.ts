import { MembershipRole, UserRole } from "@/app/generated/prisma/client";
import {
  AdminPermissionKey,
  canAccessAdminRoute,
  getDefaultAdminRoute,
  getUserAdminPermissions,
  hasAdminPanelAccess,
  userHasAnyPermission,
  userHasPermission,
} from "@/lib/admin-permissions";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export type SessionContext = {
  userId: string;
  email: string;
  organizationId: string;
  membershipRole: MembershipRole;
  systemRole: UserRole;
};

export async function getTenantContext(): Promise<SessionContext | null> {
  const session = await getSession();
  if (!session?.organizationId) return null;
  return session as SessionContext;
}

export async function requireTenant() {
  const ctx = await getTenantContext();
  if (!ctx) redirect("/login");
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId: ctx.userId, organizationId: ctx.organizationId } },
    include: { organization: true, user: true },
  });
  if (!membership || !membership.user.isActive) redirect("/login");
  return { ...ctx, membership, organization: membership.organization, user: membership.user };
}

export async function requireTenantApi() {
  const ctx = await getTenantContext();
  if (!ctx) {
    return { error: NextResponse.json({ error: "Oturum gerekli." }, { status: 401 }) };
  }
  try {
    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: ctx.userId, organizationId: ctx.organizationId } },
      include: { organization: true, user: true },
    });
    if (!membership || !membership.user.isActive) {
      return { error: NextResponse.json({ error: "Geçersiz oturum." }, { status: 401 }) };
    }
    return { ctx, membership, organization: membership.organization, user: membership.user };
  } catch (err) {
    console.error("[requireTenantApi]", err);
    return {
      error: NextResponse.json({ error: "Veritabanı bağlantı hatası." }, { status: 503 }),
    };
  }
}

export async function requirePlatformAdmin() {
  const tenant = await requireTenant();
  if (!hasAdminPanelAccess(tenant.user)) redirect("/dashboard");
  return tenant;
}

export async function requirePlatformAdminApi() {
  const auth = await requireTenantApi();
  if (auth.error) return auth;
  if (!hasAdminPanelAccess(auth.user)) {
    return { error: NextResponse.json({ error: "Yetkisiz." }, { status: 403 }) };
  }
  return auth;
}

export async function requireSuperAdmin() {
  const tenant = await requireTenant();
  if (tenant.user.role !== UserRole.SUPER_ADMIN) redirect(getDefaultAdminRoute(tenant.user));
  return tenant;
}

export async function requireSuperAdminApi() {
  const auth = await requireTenantApi();
  if (auth.error) return auth;
  if (auth.user.role !== UserRole.SUPER_ADMIN) {
    return { error: NextResponse.json({ error: "Yetkisiz." }, { status: 403 }) };
  }
  return auth;
}

export async function requireAdminPermission(permission: AdminPermissionKey) {
  const tenant = await requirePlatformAdmin();
  if (!userHasPermission(tenant.user, permission)) {
    redirect(getDefaultAdminRoute(tenant.user));
  }
  return tenant;
}

export async function requireAdminPermissionApi(permission: AdminPermissionKey) {
  const auth = await requirePlatformAdminApi();
  if (auth.error) return auth;
  if (!userHasPermission(auth.user, permission)) {
    return { error: NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 }) };
  }
  return auth;
}

export async function requireAdminAnyPermissionApi(permissions: AdminPermissionKey[]) {
  const auth = await requirePlatformAdminApi();
  if (auth.error) return auth;
  if (!userHasAnyPermission(auth.user, permissions)) {
    return { error: NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 }) };
  }
  return auth;
}

export async function requireAdminRouteAccess(path: string) {
  const tenant = await requirePlatformAdmin();
  if (!canAccessAdminRoute(tenant.user, path)) {
    redirect(getDefaultAdminRoute(tenant.user));
  }
  return tenant;
}

export function orgWhere(organizationId: string) {
  return { organizationId };
}

export { getUserAdminPermissions, hasAdminPanelAccess, userHasPermission };
