import { NextRequest, NextResponse } from "next/server";
import { requireTenantApi } from "@/lib/auth-api";
import { isStaticOnlyType } from "@/lib/qr/catalog";
import { buildQrContent } from "@/lib/qr/generators";
import { normalizeQrData } from "@/lib/qr/normalize";
import { parseDesign, renderPreviewPng } from "@/lib/qr/render";
import { validateQrInput, qrValidationResponse } from "@/lib/qr/validate-input";
import { getAppUrlFromHeaders } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let auth;
  try {
    auth = await requireTenantApi();
  } catch (err) {
    console.error("[qr/preview] auth error:", err);
    return NextResponse.json(
      { error: "Oturum doğrulanamadı.", errors: ["Oturum doğrulanamadı."] },
      { status: 401 },
    );
  }

  if (auth.error) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi.", errors: ["Geçersiz istek gövdesi."] },
      { status: 400 },
    );
  }

  try {
    const baseUrl = getAppUrlFromHeaders(req.headers);
    const type = String(body.type || "URL");
    const mode = (isStaticOnlyType(type) ? "STATIC" : String(body.mode || "DYNAMIC")) as "STATIC" | "DYNAMIC";
    const payload = (body.payload as Record<string, unknown>) || { url: body.targetUrl || "" };

    const normalized = normalizeQrData(type, payload, String(body.targetUrl || ""), baseUrl);

    const check = validateQrInput({
      name: String(body.name || "önizleme"),
      type,
      mode,
      shortCode: String(body.shortCode || "preview"),
      targetUrl: normalized.targetUrl,
      payload: normalized.payload,
      baseUrl,
    });

    if (!check.valid) {
      return NextResponse.json(qrValidationResponse(check.errors), { status: 400 });
    }

    const content = buildQrContent({
      type,
      mode,
      shortCode: String(body.shortCode || "preview"),
      targetUrl: normalized.targetUrl,
      payload: normalized.payload,
      baseUrl,
    });

    if (!content?.trim()) {
      return NextResponse.json(
        qrValidationResponse(["QR içeriği oluşturulamadı."]),
        { status: 400 },
      );
    }

    const design = parseDesign((body.design as Record<string, unknown>) || {});
    const png = await renderPreviewPng(content, design);

    if (!png?.length) {
      return NextResponse.json(
        { error: "PNG oluşturulamadı.", errors: ["PNG oluşturulamadı."] },
        { status: 500 },
      );
    }

    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(png.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[qr/preview]", err);
    const message = err instanceof Error ? err.message : "Önizleme oluşturulamadı.";
    return NextResponse.json({ error: message, errors: [message] }, { status: 500 });
  }
}
