import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PaymentStatus } from "@/app/generated/prisma/client";
import { getCreditPackage } from "@/lib/billing/packages";
import { getAppBaseUrl } from "@/lib/billing/posnet/config";
import { initializeIyzicoCheckout, isIyzicoConfigured } from "@/lib/billing/iyzico/client";
import { getCardProvider } from "@/lib/billing/payment-config";
import { requireTenantApi } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

const schema = z.object({ orderId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const auth = await requireTenantApi();
  if (auth.error) return auth.error;

  try {
    const { orderId } = schema.parse(await req.json());
    const provider = getCardProvider();

    if (!provider) {
      return NextResponse.json(
        { error: "Kart ödemesi yapılandırılmadı. IYZICO veya POSNET bilgilerini ekleyin." },
        { status: 503 },
      );
    }

    const order = await prisma.paymentOrder.findFirst({
      where: { id: orderId, organizationId: auth.organization.id },
    });

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    if (order.status === PaymentStatus.COMPLETED) {
      return NextResponse.json({ ok: true, alreadyCompleted: true });
    }

    if (order.status !== PaymentStatus.PENDING && order.status !== PaymentStatus.AWAITING_CONFIRMATION) {
      return NextResponse.json({ error: "Sipariş ödenemez." }, { status: 409 });
    }

    if (provider === "posnet") {
      return NextResponse.json({
        ok: true,
        checkoutUrl: `/dashboard/billing/checkout/${order.id}`,
      });
    }

    if (provider === "iyzico" && isIyzicoConfigured()) {
      const pkg = getCreditPackage(order.packageId);
      const baseUrl = getAppBaseUrl();
      const callbackUrl = `${baseUrl}/api/billing/iyzico/callback`;

      const checkout = await initializeIyzicoCheckout({
        orderId: order.id,
        packageId: order.packageId,
        packageName: pkg?.name ?? "Kredi paketi",
        amountTry: order.amountTry,
        buyerEmail: auth.user.email,
        buyerName: auth.user.name || auth.organization.name,
        callbackUrl,
      });

      const meta = JSON.parse(order.metadata || "{}");
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: {
          provider: "iyzico",
          metadata: JSON.stringify({
            ...meta,
            iyzicoToken: checkout.token,
            cardInitAt: new Date().toISOString(),
          }),
        },
      });

      return NextResponse.json({
        ok: true,
        redirectUrl: checkout.paymentPageUrl,
      });
    }

    return NextResponse.json({ error: "Kart ödeme sağlayıcısı hazır değil." }, { status: 503 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Kart ödemesi başlatılamadı." },
      { status: 400 },
    );
  }
}
