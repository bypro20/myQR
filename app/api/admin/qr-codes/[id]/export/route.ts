import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { requireAdminAnyPermissionApi } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { getQrContent } from "@/lib/qr/service";
import { computeFrameLayout, shouldApplyFrame } from "@/lib/qr/frame";
import { parseDesign, renderQrPng, renderQrSvg } from "@/lib/qr/render";
import { getAppUrlFromHeaders } from "@/lib/utils";
import { validateStoredQr, qrValidationResponse } from "@/lib/qr/validate-input";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

function attachmentHeaders(fileName: string, contentType: string, inline = false) {
  const ascii = fileName.replace(/[^\x20-\x7E]/g, "_");
  const disposition = inline ? "inline" : "attachment";
  return {
    "Content-Type": contentType,
    "Content-Disposition": `${disposition}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    "Cache-Control": "private, max-age=300",
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireAdminAnyPermissionApi(["qr_codes_view"]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const format = req.nextUrl.searchParams.get("format") || "png";
  const inline = req.nextUrl.searchParams.get("inline") === "1";

  const qr = await prisma.qrCode.findUnique({ where: { id } });
  if (!qr) return NextResponse.json({ error: "QR bulunamadı." }, { status: 404 });

  const baseUrl = getAppUrlFromHeaders(req.headers);
  const check = validateStoredQr(qr, baseUrl);
  if (!check.valid) {
    return NextResponse.json(qrValidationResponse(check.errors), { status: 400 });
  }

  const content = getQrContent(qr, baseUrl);
  const design = parseDesign(qr.design);
  const baseName = `${qr.name}-${qr.shortCode || qr.id}`.replace(/\s+/g, "-");

  try {
    if (format === "svg") {
      const svg = await renderQrSvg(content, qr.design);
      return new NextResponse(svg, { headers: attachmentHeaders(`${baseName}.svg`, "image/svg+xml", inline) });
    }

    if (format === "pdf") {
      const png = await renderQrPng(content, qr.design);
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const img = `data:image/png;base64,${png.toString("base64")}`;
      const layout = shouldApplyFrame(design) ? computeFrameLayout(design) : { width: design.size, height: design.size };
      const drawW = 120;
      const drawH = (layout.height / layout.width) * drawW;
      doc.addImage(img, "PNG", 15, 25, drawW, drawH);
      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
      return new NextResponse(pdfBuffer, { headers: attachmentHeaders(`${baseName}.pdf`, "application/pdf", inline) });
    }

    const png = await renderQrPng(content, qr.design);
    return new NextResponse(new Uint8Array(png), { headers: attachmentHeaders(`${baseName}.png`, "image/png", inline) });
  } catch (err) {
    console.error("[admin qr export]", err);
    return NextResponse.json({ error: "QR dosyası oluşturulamadı." }, { status: 500 });
  }
}
