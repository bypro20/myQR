import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  MembershipRole,
  PlanTier,
  SubscriptionStatus,
  UserRole,
} from "@/app/generated/prisma/client";
import { hashPassword } from "@/lib/auth";
import { logActivity } from "@/lib/admin/activity-log";
import { ActivityKind } from "@/app/generated/prisma/client";
import { transferCredits } from "@/lib/credits";
import { listPartnerCustomers, requirePartnerApi } from "@/lib/partner";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  company: z.string().min(2).max(120),
  planTier: z.nativeEnum(PlanTier).default(PlanTier.FREE),
  credits: z.number().int().min(0).default(0),
});

export async function GET() {
  const auth = await requirePartnerApi();
  if (auth.error) return auth.error;

  const [customers, partnerOrg] = await Promise.all([
    listPartnerCustomers(auth.organization.id),
    auth.organization,
  ]);

  const totalCustomerCredits = customers.reduce((sum, c) => sum + c.credits, 0);
  const totalQrCodes = customers.reduce((sum, c) => sum + c._count.qrCodes, 0);

  return NextResponse.json({
    partner: {
      id: partnerOrg.id,
      name: partnerOrg.name,
      credits: partnerOrg.credits,
      unlimitedCredits: partnerOrg.unlimitedCredits,
    },
    stats: {
      customerCount: customers.length,
      activeCustomers: customers.filter((c) => c.memberships[0]?.user.isActive).length,
      totalCustomerCredits,
      totalQrCodes,
    },
    customers: customers.map((org) => {
      const owner = org.memberships[0]?.user;
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        planTier: org.planTier,
        credits: org.credits,
        qrCount: org._count.qrCodes,
        subscriptionStatus: org.subscriptionStatus,
        createdAt: org.createdAt,
        owner: owner
          ? {
              id: owner.id,
              name: owner.name,
              email: owner.email,
              isActive: owner.isActive,
              lastLoginAt: owner.lastLoginAt,
              createdAt: owner.createdAt,
            }
          : null,
      };
    }),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requirePartnerApi();
  if (auth.error) return auth.error;

  try {
    const body = createSchema.parse(await req.json());
    const email = body.email.toLowerCase().trim();

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
    }

    if (body.credits > 0 && !auth.organization.unlimitedCredits && auth.organization.credits < body.credits) {
      return NextResponse.json(
        { error: `Yetersiz kredi stoku. Mevcut: ${auth.organization.credits.toLocaleString("tr-TR")}` },
        { status: 400 },
      );
    }

    let slugBase = slugify(body.company) || slugify(body.name) || "musteri";
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
          parentOrganizationId: auth.organization.id,
          planTier: body.planTier,
          subscriptionStatus: SubscriptionStatus.TRIAL,
          trialEndsAt: trialEnds,
          credits: 0,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: MembershipRole.OWNER,
        },
      });

      return { user, organization };
    });

    if (body.credits > 0) {
      await transferCredits(
        auth.organization.id,
        result.organization.id,
        body.credits,
        `İş ortağı başlangıç kredisi — ${result.organization.name}`,
        result.organization.id,
      );
    }

    const created = await prisma.organization.findUniqueOrThrow({
      where: { id: result.organization.id },
      include: {
        memberships: {
          where: { role: "OWNER" },
          take: 1,
          include: { user: { select: { id: true, name: true, email: true, isActive: true } } },
        },
      },
    });

    void logActivity({
      kind: ActivityKind.USER_CREATED,
      actorUserId: auth.user.id,
      actorRole: auth.user.role,
      organizationId: auth.organization.id,
      targetType: "organization",
      targetId: created.id,
      targetLabel: created.name,
      message: `${auth.user.name} iş ortağı olarak müşteri paneli oluşturdu: ${created.name} (${result.user.email})`,
    });

    const partnerOrg = await prisma.organization.findUniqueOrThrow({
      where: { id: auth.organization.id },
      select: { credits: true, unlimitedCredits: true },
    });

    return NextResponse.json(
      {
        ok: true,
        partnerCredits: partnerOrg.credits,
        customer: {
          id: created.id,
          name: created.name,
          slug: created.slug,
          planTier: created.planTier,
          credits: created.credits,
          owner: created.memberships[0]?.user ?? null,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz form verisi." }, { status: 400 });
    }
    if (err instanceof Error && err.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json({ error: "Yetersiz kredi stoku." }, { status: 400 });
    }
    console.error("[partner/customers POST]", err);
    return NextResponse.json({ error: "Müşteri oluşturulamadı." }, { status: 500 });
  }
}
