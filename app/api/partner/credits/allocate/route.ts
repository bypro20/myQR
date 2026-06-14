import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertChildOrganization, requirePartnerApi } from "@/lib/partner";
import { transferCredits } from "@/lib/credits";
import { MAX_PARTNER_CREDIT_TRANSFER } from "@/lib/security/limits";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  organizationId: z.string().min(1).max(64),
  amount: z.number().int().positive().max(MAX_PARTNER_CREDIT_TRANSFER),
});

export async function POST(req: NextRequest) {
  const auth = await requirePartnerApi();
  if (auth.error) return auth.error;

  try {
    const body = schema.parse(await req.json());
    const child = await assertChildOrganization(auth.organization.id, body.organizationId);
    if (!child) {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }

    if (!auth.organization.unlimitedCredits && auth.organization.credits < body.amount) {
      return NextResponse.json(
        { error: `Yetersiz kredi stoku. Mevcut: ${auth.organization.credits.toLocaleString("tr-TR")}` },
        { status: 400 },
      );
    }

    await transferCredits(
      auth.organization.id,
      child.id,
      body.amount,
      `İş ortağı kredi aktarımı — ${child.name}`,
      child.id,
    );

    const [partnerOrg, customerOrg] = await Promise.all([
      prisma.organization.findUniqueOrThrow({
        where: { id: auth.organization.id },
        select: { credits: true, unlimitedCredits: true },
      }),
      prisma.organization.findUniqueOrThrow({
        where: { id: child.id },
        select: { credits: true, name: true },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      partnerCredits: partnerOrg.credits,
      customer: {
        id: child.id,
        name: customerOrg.name,
        credits: customerOrg.credits,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz form verisi." }, { status: 400 });
    }
    if (err instanceof Error && err.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json({ error: "Yetersiz kredi stoku." }, { status: 400 });
    }
    return NextResponse.json({ error: "Kredi aktarılamadı." }, { status: 500 });
  }
}
