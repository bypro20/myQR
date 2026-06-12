import { NextRequest, NextResponse } from "next/server";
import { buildQrContent } from "@/lib/qr/generators";
import { renderQrPng } from "@/lib/qr/render";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const content = buildQrContent({
    type: body.type || "URL",
    mode: body.mode || "DYNAMIC",
    shortCode: body.shortCode || "preview",
    targetUrl: body.targetUrl,
    payload: body.payload || { url: body.targetUrl || "https://myqr.com" },
  });

  const png = await renderQrPng(content, JSON.stringify(body.design || {}));
  return new NextResponse(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
  });
}
