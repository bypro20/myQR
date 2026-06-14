import { notFound, redirect } from "next/navigation";
import { PaymentStatus } from "@/app/generated/prisma/client";
import { PosnetRedirectForm } from "@/components/billing/posnet-redirect-form";
import { createPosnetCheckoutSession } from "@/lib/billing/posnet/oos";
import { isPaymentCheckoutReady } from "@/lib/billing/payment-config";
import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

type Props = {
  params: Promise<{ orderId: string }>;
};

export default async function BillingCheckoutPage({ params }: Props) {
  const { orderId } = await params;
  const { organization } = await requireTenant();

  if (!isPaymentCheckoutReady()) {
    redirect("/dashboard/billing?payment=unconfigured");
  }

  const order = await prisma.paymentOrder.findFirst({
    where: { id: orderId, organizationId: organization.id },
  });

  if (!order) notFound();
  if (order.status === PaymentStatus.COMPLETED) {
    redirect("/dashboard/billing?payment=success");
  }
  if (order.status !== PaymentStatus.PENDING) {
    redirect("/dashboard/billing?payment=failed");
  }

  let session;
  try {
    session = await createPosnetCheckoutSession(order.id, order.amountTry);
  } catch (err) {
    console.error(err);
    redirect("/dashboard/billing?payment=failed");
  }

  return (
    <PosnetRedirectForm action={session.gatewayUrl} fields={session.fields} />
  );
}
