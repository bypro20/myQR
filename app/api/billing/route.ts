import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PaymentStatus } from "@/app/generated/prisma/client";
import { buildFastOrderMeta } from "@/lib/billing/fast/config";
import { fastReferenceCode } from "@/lib/billing/fast/reference";
import { getCreditPackage } from "@/lib/billing/packages";
import { isPaymentCheckoutReady } from "@/lib/billing/payment-config";
import { requireTenantApi } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

const schema = z.object({ packageId: z.string() });

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
    const { packageId } = schema.parse(await req.json());
    const pkg = getCreditPackage(packageId);
    if (!pkg) {
      return NextResponse.json({ error: "Geçersiz paket." }, { status: 400 });
    }

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

    const totalCredits = pkg.credits + pkg.bonus;

    const order = await prisma.paymentOrder.create({
      data: {
        organizationId: auth.organization.id,
        packageId: pkg.id,
        amountTry: pkg.priceTry,
        credits: totalCredits,
        status: PaymentStatus.PENDING,
        provider: "checkout",
        metadata: "{}",
      },
    });

    const meta = buildFastOrderMeta(order.id, fastReferenceCode(order.id));
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: { metadata: JSON.stringify(meta) },
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
