import { UserRole } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireTenant, requireTenantApi } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export function isPartnerRole(role: UserRole | string) {
  return role === UserRole.PARTNER;
}

export async function requirePartner() {
  const tenant = await requireTenant();
  if (!isPartnerRole(tenant.user.role)) redirect("/dashboard");
  return tenant;
}

export async function requirePartnerApi() {
  const auth = await requireTenantApi();
  if (auth.error) return auth;
  if (!isPartnerRole(auth.user.role)) {
    return { error: NextResponse.json({ error: "İş ortağı yetkisi gerekli." }, { status: 403 }) };
  }
  return auth;
}

export async function assertChildOrganization(partnerOrgId: string, childOrgId: string) {
  const org = await prisma.organization.findFirst({
    where: { id: childOrgId, parentOrganizationId: partnerOrgId },
    include: {
      memberships: {
        where: { role: "OWNER" },
        take: 1,
        include: { user: { select: { id: true, name: true, email: true, isActive: true, lastLoginAt: true, createdAt: true } } },
      },
      _count: { select: { qrCodes: true } },
    },
  });
  if (!org) return null;
  return org;
}

export async function listPartnerCustomers(partnerOrgId: string) {
  return prisma.organization.findMany({
    where: { parentOrganizationId: partnerOrgId },
    orderBy: { createdAt: "desc" },
    include: {
      memberships: {
        where: { role: "OWNER" },
        take: 1,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
              lastLoginAt: true,
              createdAt: true,
            },
          },
        },
      },
      _count: { select: { qrCodes: true } },
    },
  });
}
