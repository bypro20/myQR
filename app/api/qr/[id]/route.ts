import { NextRequest, NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";
import { getQrContent, updateQrCode } from "@/lib/qr/service";
import { checkTargetUrl, validateQrDesign } from "@/lib/qr/render";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;
  const { id } = await params;
  const qr = await prisma.qrCode.findUnique({
    where: { id },
    include: { linkBio: true, warrantyForm: true, lcvForm: true, template: true },
  });
  if (!qr) return NextResponse.json({ error: "QR bulunamadı." }, { status: 404 });
  return NextResponse.json(qr);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;
  const qr = await updateQrCode((await params).id, await req.json());
  if (!qr) return NextResponse.json({ error: "QR bulunamadı." }, { status: 404 });
  return NextResponse.json(qr);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;
  await prisma.qrCode.delete({ where: { id: (await params).id } });
  return NextResponse.json({ ok: true });
}

export async function POST(_req: NextRequest, { params }: Params) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;
  const qr = await prisma.qrCode.findUnique({ where: { id: (await params).id } });
  if (!qr) return NextResponse.json({ error: "QR bulunamadı." }, { status: 404 });

  const content = getQrContent(qr);
  const warnings = validateQrDesign(qr.design, content.length);
  const urlCheck = qr.targetUrl ? await checkTargetUrl(qr.targetUrl) : null;
  if (!qr.isActive) warnings.push({ level: "error", message: "QR pasif durumda." });
  if (urlCheck && !urlCheck.ok) warnings.push({ level: "error", message: urlCheck.message });
  return NextResponse.json({ content, warnings, urlCheck });
}
