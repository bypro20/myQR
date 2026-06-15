import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ActivityKind } from "@/app/generated/prisma/client";
import { CreditTxType, MembershipRole, PlanTier, SubscriptionStatus } from "@/app/generated/prisma/client";
import { createSession, hashPassword } from "@/lib/auth";
import { PRICING } from "@/lib/billing/pricing-config";
import { totalSignupCredits, isLaunchActive, LAUNCH } from "@/lib/marketing/launch-config";
import { logSecurityEvent } from "@/lib/security/audit";
import { getClientIp } from "@/lib/security/client-ip";
import { isHoneypotTripped } from "@/lib/security/honeypot";
import { validatePassword } from "@/lib/security/password";
import { isTurnstileEnabled, verifyTurnstile } from "@/lib/security/turnstile";
import { requireDbReady } from "@/lib/db/require-db-ready";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  company: z.string().min(2).max(120),
  _hp: z.string().optional(),
  turnstileToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const dbBlock = await requireDbReady();
  if (dbBlock) return dbBlock;

  const ip = getClientIp(req);
  try {
    const body = schema.parse(await req.json());

    if (isHoneypotTripped(body._hp)) {
      void logSecurityEvent({
        kind: ActivityKind.SECURITY_BLOCKED,
        ip,
        path: "/api/auth/signup",
        message: "Kayıt honeypot tetiklendi",
      });
      return NextResponse.json({ error: "Kayıt oluşturulamadı." }, { status: 400 });
    }

    if (isTurnstileEnabled()) {
      const ok = await verifyTurnstile(body.turnstileToken, ip);
      if (!ok) {
        return NextResponse.json({ error: "Güvenlik doğrulaması başarısız. Sayfayı yenileyin." }, { status: 400 });
      }
    }

    const email = body.email.toLowerCase().trim();

    const pwErr = validatePassword(body.password);
    if (pwErr) {
      return NextResponse.json({ error: pwErr }, { status: 400 });
    }

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
