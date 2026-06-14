import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ orderId: string }>;
};

export default async function FastBillingPage({ params }: Props) {
  const { orderId } = await params;
  const { organization } = await requireTenant();

  const order = await prisma.paymentOrder.findFirst({
    where: { id: orderId, organizationId: organization.id },
  });

  if (!order) {
    redirect("/dashboard/billing");
  }

  redirect(`/dashboard/billing/pay/${orderId}`);
}
