import { NextResponse } from "next/server";
import { requireTenantApi } from "@/lib/auth-api";
import { orgWhere } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

/** Müşteri paneli istatistikleri — yalnızca kendi organizasyonu, canlı aktivite akışı yok */
export async function GET() {
  const auth = await requireTenantApi();
  if (auth.error) return auth.error;

  const orgFilter = orgWhere(auth.organization.id);

  const [totalQr, activeQr, dynamicQr, totalScans, topQr] = await Promise.all([
    prisma.qrCode.count({ where: orgFilter }),
    prisma.qrCode.count({ where: { ...orgFilter, isActive: true } }),
    prisma.qrCode.count({ where: { ...orgFilter, mode: "DYNAMIC" } }),
    prisma.qrScan.count({ where: { qrCode: orgFilter } }),
    prisma.qrCode.findMany({
      where: orgFilter,
      orderBy: { scanCount: "desc" },
      take: 5,
      select: { id: true, name: true, shortCode: true, scanCount: true, type: true },
    }),
  ]);

  return NextResponse.json({
    totalQr,
    activeQr,
    dynamicQr,
    totalScans,
    topQr,
    credits: auth.organization.credits,
    planTier: auth.organization.planTier,
  });
}
