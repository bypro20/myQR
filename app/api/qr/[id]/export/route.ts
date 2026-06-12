import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { requireUserApi } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";
import { getQrContent } from "@/lib/qr/service";
import { parseDesign, renderQrPng, renderQrSvg } from "@/lib/qr/render";
import { saveUpload } from "@/lib/uploads";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;

  const { id } = await params;
  const format = req.nextUrl.searchParams.get("format") || "png";
  const qr = await prisma.qrCode.findUnique({ where: { id } });
  if (!qr) return NextResponse.json({ error: "QR bulunamadı." }, { status: 404 });

  const content = getQrContent(qr);
  const design = parseDesign(qr.design);
  const baseName = `${qr.name}-${qr.shortCode || qr.id}`.replace(/\s+/g, "-");

  if (format === "svg") {
    const svg = await renderQrSvg(content, qr.design);
    await saveUpload("svg", `${baseName}.svg`, svg);
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="${baseName}.svg"`,
      },
    });
  }

  if (format === "pdf") {
    const png = await renderQrPng(content, qr.design);
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const img = `data:image/png;base64,${png.toString("base64")}`;
    if (design.title) doc.setFontSize(16), doc.text(design.title, 20, 20);
    doc.addImage(img, "PNG", 20, 30, 80, 80);
    if (design.caption) doc.setFontSize(11), doc.text(design.caption, 20, 120);
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    await saveUpload("pdf", `${baseName}.pdf`, pdfBuffer);
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}.pdf"`,
      },
    });
  }

  const png = await renderQrPng(content, qr.design);
  await saveUpload("png", `${baseName}.png`, png);
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${baseName}.png"`,
    },
  });
}
