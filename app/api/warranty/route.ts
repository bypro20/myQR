import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { requireUserApi } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("export") === "csv") {
    const auth = await requireUserApi();
    if (auth.error) return auth.error;
    const items = await prisma.warrantyRegistration.findMany({
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
    where: q
      ? {
          OR: [
            { customerName: { contains: q } },
            { serialNumber: { contains: q } },
            { productName: { contains: q } },
          ],
        }
      : undefined,
    include: { form: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const form = await prisma.warrantyForm.findUnique({ where: { slug: body.slug } });
  if (!form) return NextResponse.json({ error: "Form bulunamadı." }, { status: 404 });

  const item = await prisma.warrantyRegistration.create({
    data: {
      formId: form.id,
      customerName: body.customerName,
      phone: body.phone,
      email: body.email,
      productName: body.productName,
      productModel: body.productModel,
      serialNumber: body.serialNumber,
      purchaseDate: body.purchaseDate,
      invoiceNumber: body.invoiceNumber,
      purchasedFrom: body.purchasedFrom,
      warrantyStart: body.warrantyStart,
      warrantyEnd: body.warrantyEnd,
      notes: body.notes,
    },
  });
  return NextResponse.json(item, { status: 201 });
}

