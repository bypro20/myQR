import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PaymentStatus } from "@/app/generated/prisma/client";
import { buildFastOrderMeta } from "@/lib/billing/fast/config";
import { fastReferenceCode } from "@/lib/billing/fast/reference";
import { getCreditPackage } from "@/lib/billing/packages";
import {
  SUBSCRIPTION_PLAN_IDS,
  canSubscribeToPlan,
  subscriptionPackageId,
} from "@/lib/billing/order-catalog";
import { isPaymentCheckoutReady } from "@/lib/billing/payment-config";
import { getPlan } from "@/lib/plans";
import { requireTenantApi } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

const schema = z
  .object({
    packageId: z.string().optional(),
    planId: z.enum(SUBSCRIPTION_PLAN_IDS).optional(),
  })
  .refine((body) => Boolean(body.packageId || body.planId), {
    message: "packageId veya planId gerekli.",
  });

export async function GET() {
  const auth = await requireTenantApi();
  if (auth.error) return auth.error;

  const [organization, orders, transactions] = await Promise.all([
    prisma.organization.findUnique({ where: { id: auth.organization.id } }),
    prisma.paymentOrder.findMany({
      where: { organizationId: auth.organization.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.creditTransaction.findMany({
      where: { organizationId: auth.organization.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return NextResponse.json({ organization, orders, transactions });
}

export async function POST(req: NextRequest) {
  const auth = await requireTenantApi();
  if (auth.error) return auth.error;

  try {
    const body = schema.parse(await req.json());

    if (!isPaymentCheckoutReady()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Ödeme yapılandırılmadı. Kart için IYZICO, FAST için PAYMENT_IBAN ekleyin.",
        },
        { status: 503 },
      );
    }

    let packageId: string;
    let amountTry: number;
    let credits: number;
    let metadata: Record<string, unknown> = { orderType: "credits" };

    if (body.planId) {
      const allowed = canSubscribeToPlan(auth.organization, body.planId);
      if (!allowed.ok) {
        return NextResponse.json({ error: allowed.error }, { status: 400 });
      }

      const plan = getPlan(body.planId);
      packageId = subscriptionPackageId(body.planId);
      amountTry = plan.priceTry;
      credits = plan.creditsMonthly;
      metadata = { orderType: "subscription", planTier: body.planId };
    } else {
      const pkg = getCreditPackage(body.packageId!);
      if (!pkg) {
        return NextResponse.json({ error: "Geçersiz paket." }, { status: 400 });
      }

      packageId = pkg.id;
      amountTry = pkg.priceTry;
      credits = pkg.credits + pkg.bonus;
    }

    const order = await prisma.paymentOrder.create({
      data: {
        organizationId: auth.organization.id,
        packageId,
        amountTry,
        credits,
        status: PaymentStatus.PENDING,
        provider: "checkout",
        metadata: "{}",
      },
    });

    const meta = buildFastOrderMeta(order.id, fastReferenceCode(order.id));
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: {
        metadata: JSON.stringify({ ...meta, ...metadata }),
      },
    });

    return NextResponse.json({
      ok: true,
      paymentRequired: true,
      orderId: order.id,
      checkoutUrl: `/dashboard/billing/pay/${order.id}`,
    });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 400 });
  }
}
