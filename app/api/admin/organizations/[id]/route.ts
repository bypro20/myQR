import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PlanTier, SubscriptionStatus } from "@/app/generated/prisma/client";
import { adminAdjustCredits } from "@/lib/credits";
import { prisma } from "@/lib/prisma";
import { requireAdminAnyPermissionApi, requireAdminPermissionApi } from "@/lib/tenant";

const patchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  planTier: z.nativeEnum(PlanTier).optional(),
  subscriptionStatus: z.nativeEnum(SubscriptionStatus).optional(),
  creditsDelta: z.number().int().optional(),
  creditsDescription: z.string().max(200).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminPermissionApi("organizations_manage");
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const body = patchSchema.parse(await req.json());
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) {
      return NextResponse.json({ error: "Organizasyon bulunamadı." }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name) updateData.name = body.name.trim();
    if (body.planTier) updateData.planTier = body.planTier;
    if (body.subscriptionStatus) updateData.subscriptionStatus = body.subscriptionStatus;

    if (Object.keys(updateData).length > 0) {
      await prisma.organization.update({ where: { id }, data: updateData });
    }

    if (body.creditsDelta && body.creditsDelta !== 0) {
      const creditAuth = await requireAdminAnyPermissionApi(["credits_manage", "organizations_manage"]);
      if (creditAuth.error) return creditAuth.error;
      await adminAdjustCredits(
        id,
        body.creditsDelta,
        body.creditsDescription || "Admin kredi düzenlemesi",
      );
    }

    const updated = await prisma.organization.findUnique({
      where: { id },
      include: { _count: { select: { qrCodes: true, memberships: true } } },
    });

    return NextResponse.json({ ok: true, organization: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz form verisi." }, { status: 400 });
    }
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminPermissionApi("organizations_manage");
  if (auth.error) return auth.error;

  const { id } = await params;
  const org = await prisma.organization.findUnique({ where: { id } });
  if (!org) {
    return NextResponse.json({ error: "Organizasyon bulunamadı." }, { status: 404 });
  }

  await prisma.organization.update({
    where: { id },
    data: { subscriptionStatus: SubscriptionStatus.CANCELLED, credits: 0 },
  });

  return NextResponse.json({ ok: true });
}
