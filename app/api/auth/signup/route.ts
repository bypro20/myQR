import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CreditTxType, MembershipRole, PlanTier, SubscriptionStatus } from "@/app/generated/prisma/client";
import { createSession, hashPassword } from "@/lib/auth";
import { PRICING } from "@/lib/billing/pricing-config";
import { totalSignupCredits, isLaunchActive, LAUNCH } from "@/lib/marketing/launch-config";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  company: z.string().min(2).max(120),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
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
    trialEnds.setDate(trialEnds.getDate() + PRICING.trialDays);
    const signupCredits = totalSignupCredits();

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: body.name.trim(),
          passwordHash: await hashPassword(body.password),
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: body.company.trim(),
          slug,
          planTier: PlanTier.FREE,
          subscriptionStatus: SubscriptionStatus.TRIAL,
          trialEndsAt: trialEnds,
          credits: signupCredits,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: MembershipRole.OWNER,
        },
      });

      await tx.creditTransaction.create({
        data: {
          organizationId: organization.id,
          type: CreditTxType.BONUS,
          amount: signupCredits,
          balanceAfter: signupCredits,
          description: isLaunchActive()
            ? `${PRICING.trialDays} gün Pro deneme + hoş geldin kredisi + ${LAUNCH.extraSignupCredits} lansman bonusu`
            : `${PRICING.trialDays} gün Pro deneme + hoş geldin kredisi`,
        },
      });

      return { user, organization };
    });

    await createSession({
      userId: result.user.id,
      email: result.user.email,
      organizationId: result.organization.id,
      membershipRole: MembershipRole.OWNER,
      systemRole: result.user.role,
    });

    return NextResponse.json(
      {
        ok: true,
        organization: { id: result.organization.id, name: result.organization.name, slug: result.organization.slug },
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz form verisi." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Kayıt oluşturulamadı." }, { status: 500 });
  }
}
