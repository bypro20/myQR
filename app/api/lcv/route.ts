import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { parseLcvSubmission, publicFormRateLimit } from "@/lib/api/public-form-guard";
import { requireUserApi } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

const orgFilter = (organizationId: string) => ({
  form: { qrCode: { organizationId } },
});

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("export") === "csv") {
    const auth = await requireUserApi();
    if (auth.error) return auth.error;
    const items = await prisma.lcvRegistration.findMany({
      where: orgFilter(auth.organization.id),
      include: { form: true },
    });
    const csv = Papa.unparse(
      items.map((i) => ({
        Etkinlik: i.form.eventName,
        "Ad Soyad": i.fullName,
        Telefon: i.phone,
        Katılım: i.attendance,
        "Kişi Sayısı": i.guestCount,
        Not: i.notes,
      })),
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="lcv-kayitlari.csv"',
      },
    });
  }

  const auth = await requireUserApi();
  if (auth.error) return auth.error;

  const event = req.nextUrl.searchParams.get("event")?.trim();
  const items = await prisma.lcvRegistration.findMany({
    where: {
      ...orgFilter(auth.organization.id),
      ...(event ? { form: { eventName: { contains: event }, qrCode: { organizationId: auth.organization.id } } } : {}),
    },
    include: { form: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const stats = {
    total: items.length,
    attending: items.filter((i) => i.attendance === "Katılacağım").length,
    notAttending: items.filter((i) => i.attendance === "Katılamayacağım").length,
  };

  return NextResponse.json({ items, stats });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = parseLcvSubmission(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!publicFormRateLimit(`lcv:${parsed.data.slug}:${ip}`)) {
    return NextResponse.json({ error: "Çok fazla istek. Lütfen biraz bekleyin." }, { status: 429 });
  }

  const form = await prisma.lcvForm.findUnique({
    where: { slug: parsed.data.slug },
    include: { qrCode: { select: { isActive: true } } },
  });
  if (!form || !form.qrCode.isActive) {
    return NextResponse.json({ error: "Form bulunamadı." }, { status: 404 });
  }

  const item = await prisma.lcvRegistration.create({
    data: {
      formId: form.id,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      attendance: parsed.data.attendance,
      guestCount: parsed.data.guestCount,
      notes: parsed.data.notes,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
