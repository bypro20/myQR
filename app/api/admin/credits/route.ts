import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@/app/generated/prisma/client";
import {
  adminAdjustCredits,
  adminSetCredits,
  adminSetUnlimitedCredits,
} from "@/lib/credits";
import { resetAllBalances, resetCreditTransactions } from "@/lib/admin/payment-actions";
import { prisma } from "@/lib/prisma";
import { requireAdminAnyPermissionApi } from "@/lib/tenant";

const CREDIT_PERMS = ["credits_manage", "organizations_manage"] as const;

const adjustSchema = z.object({
  organizationId: z.string().optional(),
  userId: z.string().optional(),
  amount: z.number().int().refine((n) => n !== 0, "Miktar sıfır olamaz"),
  description: z.string().optional(),
});

const setSchema = z.object({
  organizationId: z.string().optional(),
  userId: z.string().optional(),
  credits: z.number().int().min(0),
  description: z.string().optional(),
});

const unlimitedSchema = z.object({
  organizationId: z.string().optional(),
  userId: z.string().optional(),
  unlimited: z.boolean(),
  description: z.string().optional(),
});

async function resolveOrganizationId(input: { organizationId?: string; userId?: string }) {
  if (input.organizationId) return input.organizationId;

  if (input.userId) {
    const membership = await prisma.membership.findFirst({
      where: { userId: input.userId },
      orderBy: { createdAt: "asc" },
      select: { organizationId: true },
    });
    if (!membership) throw new Error("USER_ORG_NOT_FOUND");
    return membership.organizationId;
  }

  throw new Error("TARGET_REQUIRED");
}

export async function GET() {
  const auth = await requireAdminAnyPermissionApi([...CREDIT_PERMS]);
  if (auth.error) return auth.error;

  const [organizations, customers, transactions, myOrg] = await Promise.all([
    prisma.organization.findMany({
      orderBy: { name: "asc" },
      take: 200,
      select: {
        id: true,
        name: true,
        slug: true,
        credits: true,
        unlimitedCredits: true,
        planTier: true,
        memberships: {
          take: 3,
          select: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { isActive: true, role: "CUSTOMER" },
      orderBy: { name: "asc" },
      take: 300,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        memberships: {
          orderBy: { createdAt: "asc" },
          take: 1,
          select: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                credits: true,
                unlimitedCredits: true,
                planTier: true,
              },
            },
          },
        },
      },
    }),
    prisma.creditTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { organization: { select: { name: true, slug: true } } },
    }),
    prisma.organization.findUnique({
      where: { id: auth.organization.id },
      select: { id: true, name: true, credits: true, unlimitedCredits: true },
    }),
  ]);

  return NextResponse.json({
    organizations,
    customers: customers.filter((u) => u.memberships[0]?.organization),
    transactions,
    myOrganization: myOrg,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAnyPermissionApi([...CREDIT_PERMS]);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const action = body.action as string | undefined;

    if (action === "set") {
      const data = setSchema.parse(body);
      const organizationId = await resolveOrganizationId(data);
      const org = await adminSetCredits(
        organizationId,
        data.credits,
        data.description || "Admin tarafından kredi ayarlandı",
      );
      return NextResponse.json({ ok: true, organization: org });
    }

    if (action === "unlimited") {
      const data = unlimitedSchema.parse(body);
      const organizationId = await resolveOrganizationId(data);
      const org = await adminSetUnlimitedCredits(
        organizationId,
        data.unlimited,
        data.description,
      );
      return NextResponse.json({ ok: true, organization: org });
    }

    if (action === "reset_transactions") {
      const organizationId = body.organizationId as string | undefined;
      const scopeAll = body.scope === "all";
      if (scopeAll) {
        if (auth.user.role !== UserRole.SUPER_ADMIN) {
          return NextResponse.json({ error: "Bu işlem yalnızca süper admin içindir." }, { status: 403 });
        }
        if (body.confirm !== "SIFIRLA") {
          return NextResponse.json({ error: "Onay için confirm: 'SIFIRLA' gönderin." }, { status: 400 });
        }
        const count = await resetCreditTransactions({});
        return NextResponse.json({ ok: true, count });
      }
      if (!organizationId && !body.userId) {
        return NextResponse.json({ error: "Organizasyon veya kullanıcı seçin." }, { status: 400 });
      }
      const orgId = organizationId || (await resolveOrganizationId({ userId: body.userId as string }));
      const count = await resetCreditTransactions({ organizationId: orgId });
      return NextResponse.json({ ok: true, count });
    }

    if (action === "reset_balances") {
      if (auth.user.role !== UserRole.SUPER_ADMIN) {
        return NextResponse.json({ error: "Bu işlem yalnızca süper admin içindir." }, { status: 403 });
      }
      if (body.confirm !== "SIFIRLA") {
        return NextResponse.json({ error: "Onay için confirm: 'SIFIRLA' gönderin." }, { status: 400 });
      }
      const count = await resetAllBalances();
      return NextResponse.json({ ok: true, count });
    }

    if (action === "reset_balance") {
      const data = setSchema.parse({ ...body, credits: 0 });
      const organizationId = await resolveOrganizationId(data);
      const org = await adminSetCredits(organizationId, 0, data.description || "Admin: bakiye sıfırlandı");
      return NextResponse.json({ ok: true, organization: org });
    }

    const data = adjustSchema.parse(body);
    const organizationId = await resolveOrganizationId(data);
    const org = await adminAdjustCredits(
      organizationId,
      data.amount,
      data.description || (data.amount > 0 ? "Admin kredi yüklemesi" : "Admin kredi düşümü"),
    );
    return NextResponse.json({ ok: true, organization: org });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }
    if (err instanceof Error && err.message === "USER_ORG_NOT_FOUND") {
      return NextResponse.json({ error: "Kullanıcının organizasyonu bulunamadı." }, { status: 404 });
    }
    if (err instanceof Error && err.message === "TARGET_REQUIRED") {
      return NextResponse.json({ error: "Kullanıcı veya organizasyon seçin." }, { status: 400 });
    }
    return NextResponse.json({ error: "Kredi işlemi başarısız." }, { status: 500 });
  }
}
