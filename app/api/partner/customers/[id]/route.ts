import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PlanTier } from "@/app/generated/prisma/client";
import { hashPassword } from "@/lib/auth";
import { assertChildOrganization, requirePartnerApi } from "@/lib/partner";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  company: z.string().min(2).max(120).optional(),
  planTier: z.nativeEnum(PlanTier).optional(),
  isActive: z.boolean().optional(),
  newPassword: z.string().min(8).max(128).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requirePartnerApi();
  if (auth.error) return auth.error;

  const { id } = await params;
  const child = await assertChildOrganization(auth.organization.id, id);
  if (!child) {
    return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
  }

  const owner = child.memberships[0]?.user;
  if (!owner) {
    return NextResponse.json({ error: "Müşteri hesabı bulunamadı." }, { status: 404 });
  }

  try {
    const body = patchSchema.parse(await req.json());

    if (body.email) {
      const email = body.email.toLowerCase().trim();
      const taken = await prisma.user.findFirst({ where: { email, NOT: { id: owner.id } } });
      if (taken) {
        return NextResponse.json({ error: "Bu e-posta kullanımda." }, { status: 409 });
      }
    }

    if (body.name || body.email || body.isActive !== undefined || body.newPassword) {
      const userData: Record<string, unknown> = {};
      if (body.name) userData.name = body.name.trim();
      if (body.email) userData.email = body.email.toLowerCase().trim();
      if (body.isActive !== undefined) userData.isActive = body.isActive;
      if (body.newPassword) userData.passwordHash = await hashPassword(body.newPassword);
      await prisma.user.update({ where: { id: owner.id }, data: userData });
    }

    if (body.company || body.planTier) {
      const orgData: Record<string, unknown> = {};
      if (body.company) orgData.name = body.company.trim();
      if (body.planTier) orgData.planTier = body.planTier;
      await prisma.organization.update({ where: { id: child.id }, data: orgData });
    }

    const updated = await assertChildOrganization(auth.organization.id, id);
    const updatedOwner = updated?.memberships[0]?.user;

    return NextResponse.json({
      ok: true,
      customer: {
        id: updated!.id,
        name: updated!.name,
        planTier: updated!.planTier,
        credits: updated!.credits,
        qrCount: updated!._count.qrCodes,
        owner: updatedOwner
          ? {
              id: updatedOwner.id,
              name: updatedOwner.name,
              email: updatedOwner.email,
              isActive: updatedOwner.isActive,
            }
          : null,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz form verisi." }, { status: 400 });
    }
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  }
}
