import { NextRequest, NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth-api";
import { validateUpload } from "@/lib/api/upload-guard";
import { saveUpload } from "@/lib/uploads";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;

  const form = await req.formData();
  const file = form.get("file");
  const category = String(form.get("category") || "logos");
  const qrCodeId = form.get("qrCodeId") ? String(form.get("qrCodeId")) : undefined;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Dosya gerekli." }, { status: 400 });
  }

  const check = validateUpload(file, category);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  if (qrCodeId) {
    const owned = await prisma.qrCode.findFirst({
      where: { id: qrCodeId, organizationId: auth.organization.id },
      select: { id: true },
    });
    if (!owned) {
      return NextResponse.json({ error: "QR bulunamadı." }, { status: 404 });
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const saved = await saveUpload(
    category as "logos" | "png" | "svg" | "pdf" | "templates" | "bulk",
    file.name,
    buffer,
  );

  const record = await prisma.uploadedFile.create({
    data: {
      organizationId: auth.organization.id,
      qrCodeId,
      category,
      fileName: saved.fileName,
      mimeType: file.type || "application/octet-stream",
      size: buffer.length,
      path: saved.path,
    },
  });

  return NextResponse.json(record);
}
