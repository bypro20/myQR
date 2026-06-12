import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveRedirectTarget } from "@/lib/qr/resolve-target";
import { recordScan } from "@/lib/scan";

type Params = { params: Promise<{ code: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { code } = await params;
  const qr = await prisma.qrCode.findUnique({ where: { shortCode: code } });

  if (!qr || !qr.isActive) {
    return NextResponse.json({ error: "QR bulunamadı veya pasif." }, { status: 404 });
  }

  await recordScan(qr.id, req);
  const target = resolveRedirectTarget(qr);

  if (!target) {
    return NextResponse.json({ error: "Hedef bağlantı tanımlı değil." }, { status: 404 });
  }

  return NextResponse.redirect(target, 302);
}
