import { NextRequest, NextResponse } from "next/server";
import { Prisma, QrMode, QrType } from "@/app/generated/prisma/client";
import { summarizeQrForAdmin } from "@/lib/qr/admin-summary";
import { requireAdminAnyPermissionApi } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  const auth = await requireAdminAnyPermissionApi(["qr_codes_view"]);
  if (auth.error) return auth.error;

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const type = sp.get("type")?.trim();
  const mode = sp.get("mode")?.trim();
  const organizationId = sp.get("organizationId")?.trim();
  const userId = sp.get("userId")?.trim();
  const page = Math.max(1, Number(sp.get("page") || 1));

  const where: Prisma.QrCodeWhereInput = {
    ...(organizationId ? { organizationId } : {}),
    ...(userId ? { organization: { memberships: { some: { userId } } } } : {}),
    ...(type ? { type: type as QrType } : {}),
    ...(mode ? { mode: mode as QrMode } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { customerName: { contains: q } },
            { projectName: { contains: q } },
            { shortCode: { contains: q } },
            { organization: { name: { contains: q } } },
            { organization: { slug: { contains: q } } },
            { organization: { memberships: { some: { user: { email: { contains: q } } } } } },
            { organization: { memberships: { some: { user: { name: { contains: q } } } } } },
          ],
        }
      : {}),
  };

  const [items, total, organizations, users] = await Promise.all([
    prisma.qrCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        type: true,
        mode: true,
        shortCode: true,
        targetUrl: true,
        payload: true,
        customerName: true,
        projectName: true,
        productType: true,
        description: true,
        isActive: true,
        scanCount: true,
        lastScannedAt: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            planTier: true,
            memberships: {
              where: { role: "OWNER" },
              take: 1,
              select: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    }),
    prisma.qrCode.count({ where }),
    prisma.organization.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, _count: { select: { qrCodes: true } } },
    }),
    prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        memberships: { some: { organization: { qrCodes: { some: {} } } } },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        _count: { select: { memberships: true } },
      },
    }),
  ]);

  const qrIds = items.map((q) => q.id);
  const creditTxs =
    qrIds.length > 0
      ? await prisma.creditTransaction.findMany({
          where: { referenceId: { in: qrIds }, type: "SPEND" },
          select: { referenceId: true, amount: true, description: true, createdAt: true },
        })
      : [];
  const creditByQr = new Map(creditTxs.map((c) => [c.referenceId!, c]));

  return NextResponse.json({
    items: items.map((qr) => {
      const summary = summarizeQrForAdmin(qr);
      const credit = creditByQr.get(qr.id);
      return {
        id: qr.id,
        name: qr.name,
        type: qr.type,
        mode: qr.mode,
        shortCode: qr.shortCode,
        targetUrl: qr.targetUrl,
        customerName: qr.customerName,
        projectName: qr.projectName,
        productType: qr.productType,
        description: qr.description,
        isActive: qr.isActive,
        scanCount: qr.scanCount,
        lastScannedAt: qr.lastScannedAt,
        createdAt: qr.createdAt,
        updatedAt: qr.updatedAt,
        action: summary.action,
        operationDetail: summary.detail,
        typeLabel: summary.typeLabel,
        creditSpent: credit ? Math.abs(credit.amount) : null,
        creditDescription: credit?.description ?? null,
        owner: qr.organization.memberships[0]?.user ?? null,
        organization: {
          id: qr.organization.id,
          name: qr.organization.name,
          slug: qr.organization.slug,
          planTier: qr.organization.planTier,
        },
      };
    }),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    organizations,
    users,
  });
}
