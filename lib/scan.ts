import { prisma } from "@/lib/prisma";
import { detectDevice, hashIp } from "@/lib/uploads";

export async function recordScan(qrCodeId: string, req: Request) {
  const ua = req.headers.get("user-agent") || "";
  const { deviceType, os, browser } = detectDevice(ua);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const country = req.headers.get("x-vercel-ip-country") || undefined;

  await prisma.$transaction([
    prisma.qrScan.create({
      data: {
        qrCodeId,
        deviceType,
        browser,
        os,
        country,
        ipHash: hashIp(ip),
      },
    }),
    prisma.qrCode.update({
      where: { id: qrCodeId },
      data: { scanCount: { increment: 1 }, lastScannedAt: new Date() },
    }),
  ]);
}
