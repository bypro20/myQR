import { NextRequest, NextResponse } from "next/server";
import { verifyGuAiIntegration, integrationConfigured } from "@/lib/integration/gu-ai-auth";
import { prisma } from "@/lib/prisma";
import { getQrContent } from "@/lib/qr/service";
import { renderQrPng } from "@/lib/qr/render";
import { getAppUrlFromHeaders } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  if (!integrationConfigured()) {
    return NextResponse.json({ error: "Entegrasyon yapılandırılmamış." }, { status: 503 });
  }
  if (!verifyGuAiIntegration(req)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const { id } = await params;
  const qr = await prisma.qrCode.findUnique({ where: { id } });
  if (!qr) {
    return NextResponse.json({ error: "QR bulunamadı." }, { status: 404 });
  }

  const baseUrl = getAppUrlFromHeaders(req.headers);
  const content = getQrContent(qr, baseUrl);

  try {
    const png = await renderQrPng(content, qr.design);
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("[integration/gu-ai/whatsapp-qr png]", err);
    return NextResponse.json({ error: "Görsel üretilemedi." }, { status: 500 });
  }
}
