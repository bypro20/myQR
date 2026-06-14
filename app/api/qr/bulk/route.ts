import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import JSZip from "jszip";
import { requireUserApi } from "@/lib/auth-api";
import { getEffectivePlanTier } from "@/lib/billing/pricing-config";
import { getOrganizationBalance } from "@/lib/credits";
import { planAllows, type PlanTier } from "@/lib/plans";
import { handleQrWriteError } from "@/lib/qr/api-errors";
import { createQrCode, getQrContent } from "@/lib/qr/service";
import { renderQrPng } from "@/lib/qr/render";
import { saveUpload } from "@/lib/uploads";
import { getAppUrlFromHeaders } from "@/lib/utils";

export const runtime = "nodejs";

const MAX_ROWS = 100;

export async function POST(req: NextRequest) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;

  try {
    const org = await getOrganizationBalance(auth.organization.id);
    const effectiveTier = getEffectivePlanTier(org);
    if (!org.unlimitedCredits && !planAllows(effectiveTier, "bulkExport")) {
      throw new Error("PLAN_NO_BULK");
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "CSV dosyası gerekli." }, { status: 400 });
    }

    const parsed = Papa.parse<Record<string, string>>(await file.text(), {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.data.length > MAX_ROWS) {
      return NextResponse.json({ error: `En fazla ${MAX_ROWS} satır işlenebilir.` }, { status: 400 });
    }

    const zip = new JSZip();
    const baseUrl = getAppUrlFromHeaders(req.headers);
    const errors: string[] = [];
    let count = 0;

    for (const [index, row] of parsed.data.entries()) {
      try {
        const targetUrl = (row.targetUrl || row["Hedef bağlantı"] || "").trim();
        const qrType = row.type || row["QR tipi"] || "URL";
        if (qrType.toUpperCase() === "URL" && !targetUrl) {
          errors.push(`Satır ${index + 1}: Hedef bağlantı (URL) zorunlu.`);
          continue;
        }

        const qr = await createQrCode(auth.organization.id, {
          name: row.name || row["QR adı"] || `Toplu QR ${index + 1}`,
          type: qrType,
          mode: row.mode === "STATIC" ? "STATIC" : "DYNAMIC",
          durationTier: "FREE_TRIAL",
          targetUrl: targetUrl || undefined,
          payload: targetUrl ? { url: targetUrl } : {},
          customerName: row.customerName || row["Müşteri adı"],
          productType: row.productType || row["Ürün adı"],
          description: row.description || row["Açıklama"],
        });
        zip.file(`${qr.shortCode || qr.id}.png`, await renderQrPng(getQrContent(qr, baseUrl), qr.design));
        count += 1;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Satır işlenemedi";
        errors.push(`Satır ${index + 1}: ${msg}`);
        if (msg === "INSUFFICIENT_CREDITS" || msg === "QR_LIMIT_REACHED") break;
      }
    }

    if (count === 0) {
      return NextResponse.json(
        { error: "Hiçbir QR üretilemedi.", errors },
        { status: 400 },
      );
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const zipName = `bulk-${Date.now()}.zip`;
    void saveUpload("bulk", zipName, zipBuffer);
    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipName}"`,
        "X-QR-Count": String(count),
        ...(errors.length ? { "X-QR-Errors": errors.slice(0, 5).join(" | ") } : {}),
      },
    });
  } catch (err) {
    return handleQrWriteError(err);
  }
}

export async function GET() {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;
  return NextResponse.json({
    columns: ["QR adı", "QR tipi", "Hedef bağlantı", "Ürün adı", "Seri numarası", "Açıklama", "Müşteri adı"],
    maxRows: MAX_ROWS,
  });
}
