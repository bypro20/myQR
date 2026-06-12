import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;

  const [totalQr, activeQr, dynamicQr, totalScans, recentScans] = await Promise.all([
    prisma.qrCode.count(),
    prisma.qrCode.count({ where: { isActive: true } }),
    prisma.qrCode.count({ where: { mode: "DYNAMIC" } }),
    prisma.qrScan.count(),
    prisma.qrScan.findMany({
      orderBy: { scannedAt: "desc" },
      take: 10,
      include: { qrCode: { select: { name: true, shortCode: true } } },
    }),
  ]);

  const topQr = await prisma.qrCode.findMany({
    orderBy: { scanCount: "desc" },
    take: 5,
    select: { id: true, name: true, shortCode: true, scanCount: true, type: true },
  });

  const daily = await prisma.qrScan.groupBy({
    by: ["scannedAt"],
    _count: true,
    orderBy: { scannedAt: "desc" },
    take: 30,
  });

  return NextResponse.json({
    totalQr,
    activeQr,
    dynamicQr,
    totalScans,
    topQr,
    recentScans,
    dailyCount: daily.length,
  });
}
