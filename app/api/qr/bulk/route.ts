import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import JSZip from "jszip";
import { requireUserApi } from "@/lib/auth-api";
import { createQrCode, getQrContent } from "@/lib/qr/service";
import { renderQrPng } from "@/lib/qr/render";
import { saveUpload } from "@/lib/uploads";

export async function POST(req: NextRequest) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;

  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "CSV dosyası gerekli." }, { status: 400 });
  }

  const parsed = Papa.parse<Record<string, string>>(await file.text(), {
    header: true,
    skipEmptyLines: true,
  });
  const zip = new JSZip();
  let count = 0;

  for (const row of parsed.data) {
    const qr = await createQrCode({
      name: row.name || row["QR adı"] || "Toplu QR",
      type: row.type || row["QR tipi"] || "URL",
      mode: row.mode === "STATIC" ? "STATIC" : "DYNAMIC",
      targetUrl: row.targetUrl || row["Hedef bağlantı"],
      payload: { url: row.targetUrl || row["Hedef bağlantı"] },
      customerName: row.customerName || row["Müşteri adı"],
      productType: row.productType || row["Ürün adı"],
      description: row.description || row["Açıklama"],
    });
    zip.file(`${qr.shortCode || qr.id}.png`, await renderQrPng(getQrContent(qr), qr.design));
    count += 1;
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  const zipName = `bulk-${Date.now()}.zip`;
  await saveUpload("bulk", zipName, zipBuffer);
  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}"`,
      "X-QR-Count": String(count),
    },
  });
}

export async function GET() {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;
  return NextResponse.json({
    columns: ["QR adı", "QR tipi", "Hedef bağlantı", "Ürün adı", "Seri numarası", "Açıklama", "Müşteri adı"],
  });
}
