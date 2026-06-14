import { NextRequest, NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";
import { getQrContent, updateQrCode } from "@/lib/qr/service";
import { checkTargetUrl, validateQrDesign } from "@/lib/qr/render";
import { handleQrWriteError } from "@/lib/qr/api-errors";
import { validateStoredQr } from "@/lib/qr/validate-input";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;
  const { id } = await params;
  const qr = await prisma.qrCode.findFirst({
    where: { id, organizationId: auth.organization.id },
    include: { linkBio: true, warrantyForm: true, lcvForm: true, template: true },
  });
  if (!qr) return NextResponse.json({ error: "QR bulunamadı." }, { status: 404 });
  return NextResponse.json(qr);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;
  try {
    const qr = await updateQrCode(auth.organization.id, (await params).id, await req.json());
    if (!qr) return NextResponse.json({ error: "QR bulunamadı." }, { status: 404 });
    return NextResponse.json(qr);
  } catch (err) {
    return handleQrWriteError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;
  const { id } = await params;
  const existing = await prisma.qrCode.findFirst({ where: { id, organizationId: auth.organization.id } });
  if (!existing) return NextResponse.json({ error: "QR bulunamadı." }, { status: 404 });
  await prisma.qrCode.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function POST(_req: NextRequest, { params }: Params) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;
  const qr = await prisma.qrCode.findFirst({ where: { id: (await params).id, organizationId: auth.organization.id } });
  if (!qr) return NextResponse.json({ error: "QR bulunamadı." }, { status: 404 });

  const content = getQrContent(qr);
  const inputCheck = validateStoredQr(qr);
  const warnings = validateQrDesign(qr.design, content.length);
  if (!inputCheck.valid) {
    for (const msg of inputCheck.errors) {
      warnings.push({ level: "error", message: msg });
    }
  }
  if (!qr.isActive) warnings.push({ level: "error", message: "QR pasif durumda." });
  const urlCheck = qr.targetUrl ? await checkTargetUrl(qr.targetUrl) : null;
  if (urlCheck && !urlCheck.ok && qr.type !== "WIFI" && qr.type !== "VCARD" && qr.type !== "EMAIL" && qr.type !== "PHONE" && qr.type !== "SMS") {
    warnings.push({ level: "error", message: urlCheck.message });
  }
  return NextResponse.json({ content, warnings, urlCheck });
}
