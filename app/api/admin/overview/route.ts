import { NextResponse } from "next/server";
import { fetchAdminSalesStats } from "@/lib/admin/payment-events";
import { getUserAdminPermissions, userHasAnyPermission } from "@/lib/admin-permissions";
import { requirePlatformAdminApi } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requirePlatformAdminApi();
  if (auth.error) return auth.error;

  const perms = getUserAdminPermissions(auth.user);
  const canUsers = userHasAnyPermission(auth.user, ["users_view", "users_manage"]);
  const canOrgs = userHasAnyPermission(auth.user, ["organizations_view", "organizations_manage"]);
  const canPayments = userHasAnyPermission(auth.user, ["payments_view"]);
  const canOverview = userHasAnyPermission(auth.user, ["overview"]);
  const canQrCodes = userHasAnyPermission(auth.user, ["qr_codes_view"]);

  const [users, organizations, payments, stats, finance] = await Promise.all([
    canUsers
      ? prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true,
            lastLoginAt: true,
          },
        })
      : Promise.resolve([]),
    canOrgs
      ? prisma.organization.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
          include: { _count: { select: { qrCodes: true, memberships: true } } },
        })
      : Promise.resolve([]),
    canPayments
      ? prisma.paymentOrder.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { organization: { select: { name: true, slug: true } } },
        })
      : Promise.resolve([]),
    Promise.all([
      canUsers ? prisma.user.count() : Promise.resolve(0),
      canOrgs ? prisma.organization.count() : Promise.resolve(0),
      canQrCodes || canOverview ? prisma.qrCode.count() : Promise.resolve(0),
      canPayments
        ? prisma.paymentOrder.aggregate({ _sum: { amountTry: true }, where: { status: "COMPLETED" } })
        : Promise.resolve({ _sum: { amountTry: 0 } }),
    ]),
    canPayments ? fetchAdminSalesStats() : Promise.resolve(null),
  ]);

  return NextResponse.json({
    users,
    organizations,
    payments,
    permissions: perms,
    finance,
    stats: {
      users: canUsers ? stats[0] : null,
      organizations: canOrgs ? stats[1] : null,
      qrCodes: canQrCodes || canOverview ? stats[2] : null,
      revenueTry: canPayments ? stats[3]._sum.amountTry || 0 : null,
      fastClaimedCount: finance?.fastClaimedCount ?? null,
      pendingPayments: finance?.pendingCount ?? null,
    },
  });
}
