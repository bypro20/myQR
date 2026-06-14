import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CreditTxType, MembershipRole, PlanTier, SubscriptionStatus, UserRole } from "@/app/generated/prisma/client";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdminPermissionApi } from "@/lib/tenant";
import { slugify } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  company: z.string().min(2).max(120),
  planTier: z.nativeEnum(PlanTier).default(PlanTier.PRO),
  credits: z.number().int().min(0).default(100),
});

export async function POST(req: NextRequest) {
  const auth = await requireAdminPermissionApi("users_manage");
  if (auth.error) return auth.error;

  try {
    const body = createSchema.parse(await req.json());
    const email = body.email.toLowerCase().trim();

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
    }

    let slugBase = slugify(body.company) || slugify(body.name) || "isletme";
    let slug = slugBase;
    let i = 1;
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${i++}`;
    }

    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 14);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: body.name.trim(),
          passwordHash: await hashPassword(body.password),
          role: UserRole.CUSTOMER,
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: body.company.trim(),
          slug,
          planTier: body.planTier,
          subscriptionStatus: SubscriptionStatus.TRIAL,
          trialEndsAt: trialEnds,
          credits: body.credits,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: MembershipRole.OWNER,
        },
      });

      if (body.credits > 0) {
        await tx.creditTransaction.create({
          data: {
            organizationId: organization.id,
            type: CreditTxType.ADMIN,
            amount: body.credits,
            balanceAfter: body.credits,
            description: "Admin tarafından oluşturuldu",
          },
        });
      }

      return { user, organization };
    });

    return NextResponse.json(
      {
        ok: true,
        user: { id: result.user.id, email: result.user.email, name: result.user.name, role: result.user.role },
        organization: { id: result.organization.id, name: result.organization.name },
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz form verisi." }, { status: 400 });
    }
    return NextResponse.json({ error: "Kullanıcı oluşturulamadı." }, { status: 500 });
  }
}
