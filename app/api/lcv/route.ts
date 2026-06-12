import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { requireUserApi } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("export") === "csv") {
    const auth = await requireUserApi();
    if (auth.error) return auth.error;
    const items = await prisma.lcvRegistration.findMany({ include: { form: true } });
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
    where: event ? { form: { eventName: { contains: event } } } : undefined,
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
  const body = await req.json();
  const form = await prisma.lcvForm.findUnique({ where: { slug: body.slug } });
  if (!form) return NextResponse.json({ error: "Form bulunamadı." }, { status: 404 });

  const item = await prisma.lcvRegistration.create({
    data: {
      formId: form.id,
      fullName: body.fullName,
      phone: body.phone,
      attendance: body.attendance,
      guestCount: Number(body.guestCount || 1),
      notes: body.notes,
    },
  });
  return NextResponse.json(item, { status: 201 });
}

