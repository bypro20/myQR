import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isQrExpired } from "@/lib/qr/duration";
import { qrExpiredHtml } from "@/lib/qr/expired-page";
import { resolveScanResponse, wifiLandingHtml } from "@/lib/qr/scan-response";
import { recordScan } from "@/lib/scan";
import { getAppUrlFromHeaders, safeFileName } from "@/lib/utils";

export const runtime = "nodejs";

type Params = { params: Promise<{ code: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { code } = await params;
  const qr = await prisma.qrCode.findUnique({ where: { shortCode: code } });

  if (!qr || !qr.isActive) {
    return NextResponse.json({ error: "QR bulunamadı veya pasif." }, { status: 404 });
  }

  if (isQrExpired(qr.expiresAt)) {
    return new NextResponse(
      qrExpiredHtml({
        qrName: qr.name,
        qrId: qr.id,
        shortCode: code,
        expiredAt: qr.expiresAt!,
        durationTier: qr.durationTier,
        headers: req.headers,
      }),
      { status: 402, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  await recordScan(qr.id, req);
  const baseUrl = getAppUrlFromHeaders(req.headers);
  const action = resolveScanResponse(qr, baseUrl);

  if (action.kind === "error") {
    return NextResponse.json({ error: action.message }, { status: 404 });
  }

  if (action.kind === "wifi") {
    return new NextResponse(wifiLandingHtml(action.payload), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (action.kind === "vcard") {
    return new NextResponse(action.content, {
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeFileName(action.fileName)}"`,
      },
    });
  }

  return NextResponse.redirect(action.url, 302);
}
