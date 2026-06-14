import { notFound, redirect } from "next/navigation";
import { PaymentStatus } from "@/app/generated/prisma/client";
import { UnifiedPaymentCheckout } from "@/components/billing/unified-payment-checkout";
import { buildFastOrderMeta } from "@/lib/billing/fast/config";
import { getFastPaymentConfig } from "@/lib/billing/fast/config";
import { fastReferenceCode } from "@/lib/billing/fast/reference";
import { getOrderLabel, getOrderPlan, getOrderType } from "@/lib/billing/order-catalog";
import {
  getCardProvider,
  isCardPaymentEnabled,
  isFastPaymentAvailable,
  isPaymentCheckoutReady,
} from "@/lib/billing/payment-config";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

type Props = {
  params: Promise<{ orderId: string }>;
};

export default async function PayBillingPage({ params }: Props) {
  const { orderId } = await params;
  const { organization } = await requireTenant();

  if (!isPaymentCheckoutReady()) {
    redirect("/dashboard/billing?payment=unconfigured");
  }

  let order = await prisma.paymentOrder.findFirst({
    where: { id: orderId, organizationId: organization.id },
  });

  if (!order) notFound();
  if (order.status === PaymentStatus.COMPLETED) {
    // still show completed state
  }

  const meta = JSON.parse(order.metadata || "{}") as { referenceCode?: string };
  let referenceCode = meta.referenceCode || fastReferenceCode(order.id);

  if (!meta.referenceCode && isFastPaymentAvailable()) {
    const updatedMeta = buildFastOrderMeta(order.id, referenceCode);
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: { metadata: JSON.stringify(updatedMeta), provider: "checkout" },
    });
    referenceCode = updatedMeta.referenceCode as string;
  }

  const pkg = getOrderPlan(order.packageId);
  const bank = isFastPaymentAvailable() ? getFastPaymentConfig() : null;
  const orderType = getOrderType(order.packageId);

  return (
    <UnifiedPaymentCheckout
      order={{
        id: order.id,
        amountTry: order.amountTry,
        credits: order.credits,
        packageName: getOrderLabel(order.packageId),
        referenceCode,
        status: order.status,
        orderType,
        period: pkg?.period,
      }}
      bank={bank}
      cardEnabled={isCardPaymentEnabled()}
      cardProvider={getCardProvider()}
      fastEnabled={isFastPaymentAvailable()}
    />
  );
}
