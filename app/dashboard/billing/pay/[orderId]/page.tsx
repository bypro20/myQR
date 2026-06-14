import { notFound, redirect } from "next/navigation";
import { PaymentStatus } from "@/app/generated/prisma/client";
import { UnifiedPaymentCheckout } from "@/components/billing/unified-payment-checkout";
import { buildFastOrderMeta } from "@/lib/billing/fast/config";
import { getCreditPackage } from "@/lib/billing/packages";
import { getFastPaymentConfig } from "@/lib/billing/fast/config";
import { fastReferenceCode } from "@/lib/billing/fast/reference";
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

  const pkg = getCreditPackage(order.packageId);
  const bank = isFastPaymentAvailable() ? getFastPaymentConfig() : null;

  return (
    <UnifiedPaymentCheckout
      order={{
        id: order.id,
        amountTry: order.amountTry,
        credits: order.credits,
        packageName: pkg?.name ?? order.packageId,
        referenceCode,
        status: order.status,
      }}
      bank={bank}
      cardEnabled={isCardPaymentEnabled()}
      cardProvider={getCardProvider()}
      fastEnabled={isFastPaymentAvailable()}
    />
  );
}
