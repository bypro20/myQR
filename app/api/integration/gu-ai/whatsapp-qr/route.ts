import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyGuAiIntegration, integrationConfigured } from "@/lib/integration/gu-ai-auth";
import { createGuAiWhatsappQr } from "@/lib/integration/gu-ai-service";
import { getQrContent } from "@/lib/qr/service";
import { getAppUrlFromHeaders } from "@/lib/utils";

const bodySchema = z.object({
  externalId: z.string().min(8).max(80),
  companyName: z.string().min(2).max(120),
  phone: z.string().min(8).max(24),
  message: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  if (!integrationConfigured()) {
    return NextResponse.json({ error: "Entegrasyon yapılandırılmamış." }, { status: 503 });
  }
  if (!verifyGuAiIntegration(req)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await req.json());
    const result = await createGuAiWhatsappQr(body);
    const baseUrl = getAppUrlFromHeaders(req.headers);
    const waUrl = getQrContent(result.qr, baseUrl);

    return NextResponse.json(
      {
        ok: true,
        created: result.created,
        organizationId: result.organizationId,
        qrId: result.qr.id,
        qrName: result.qr.name,
        waUrl,
        pngPath: `/api/integration/gu-ai/whatsapp-qr/${result.qr.id}/png`,
      },
      { status: result.created ? 201 : 200 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }
    console.error("[integration/gu-ai/whatsapp-qr POST]", err);
    return NextResponse.json({ error: "QR oluşturulamadı." }, { status: 500 });
  }
}
