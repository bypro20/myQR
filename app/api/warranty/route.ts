import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { parseWarrantySubmission, publicFormRateLimit } from "@/lib/api/public-form-guard";
import { requireUserApi } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

const orgFilter = (organizationId: string) => ({
  form: { qrCode: { organizationId } },
});

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("export") === "csv") {
    const auth = await requireUserApi();
    if (auth.error) return auth.error;
    const items = await prisma.warrantyRegistration.findMany({
      where: orgFilter(auth.organization.id),
      include: { form: true },
      orderBy: { createdAt: "desc" },
    });
    const csv = Papa.unparse(
      items.map((i) => ({
        Müşteri: i.customerName,
        Telefon: i.phone,
        "E-posta": i.email,
        Ürün: i.productName,
        Model: i.productModel,
        "Seri No": i.serialNumber,
        "Satın Alma": i.purchaseDate,
        Fatura: i.invoiceNumber,
        Firma: i.purchasedFrom,
        "Garanti Başlangıç": i.warrantyStart,
        "Garanti Bitiş": i.warrantyEnd,
        Not: i.notes,
      })),
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="garanti-kayitlari.csv"',
      },
    });
  }

  const auth = await requireUserApi();
  if (auth.error) return auth.error;

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const items = await prisma.warrantyRegistration.findMany({
    where: {
      ...orgFilter(auth.organization.id),
      ...(q
        ? {
            OR: [
              { customerName: { contains: q } },
              { serialNumber: { contains: q } },
              { productName: { contains: q } },
            ],
          }
        : {}),
    },
    include: { form: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = parseWarrantySubmission(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!publicFormRateLimit(`warranty:${parsed.data.slug}:${ip}`)) {
    return NextResponse.json({ error: "Çok fazla istek. Lütfen biraz bekleyin." }, { status: 429 });
  }

  const form = await prisma.warrantyForm.findUnique({
    where: { slug: parsed.data.slug },
    include: { qrCode: { select: { isActive: true } } },
  });
  if (!form || !form.qrCode.isActive) {
    return NextResponse.json({ error: "Form bulunamadı." }, { status: 404 });
  }

  const item = await prisma.warrantyRegistration.create({
    data: {
      formId: form.id,
      customerName: parsed.data.customerName,
      phone: parsed.data.phone,
      email: parsed.data.email || "",
      productName: parsed.data.productName,
      productModel: parsed.data.productModel,
      serialNumber: parsed.data.serialNumber,
      purchaseDate: parsed.data.purchaseDate,
      invoiceNumber: parsed.data.invoiceNumber,
      purchasedFrom: parsed.data.purchasedFrom,
      warrantyStart: parsed.data.warrantyStart,
      warrantyEnd: parsed.data.warrantyEnd,
      notes: parsed.data.notes,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
