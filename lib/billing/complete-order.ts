import { CreditTxType, PaymentStatus } from "@/app/generated/prisma/client";
import { getCreditPackage } from "@/lib/billing/packages";
import { prisma } from "@/lib/prisma";

/** Idempotent: credits are added only once when payment is confirmed. */
export async function completePaymentOrder(
  orderId: string,
  providerRef?: string,
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.paymentOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }
    if (order.status === PaymentStatus.COMPLETED) {
      return { order, alreadyCompleted: true as const };
    }
    if (order.status === PaymentStatus.FAILED || order.status === PaymentStatus.REFUNDED) {
      throw new Error("ORDER_NOT_PAYABLE");
    }
    if (
      order.status !== PaymentStatus.PENDING &&
      order.status !== PaymentStatus.AWAITING_CONFIRMATION
    ) {
      throw new Error("ORDER_NOT_PAYABLE");
    }

    const pkg = getCreditPackage(order.packageId);
    const label = pkg?.name ?? order.packageId;

    const updated = await tx.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: PaymentStatus.COMPLETED,
        completedAt: new Date(),
        ...(providerRef ? { providerRef } : {}),
      },
    });

    const org = await tx.organization.update({
      where: { id: order.organizationId },
      data: { credits: { increment: order.credits } },
    });

    await tx.creditTransaction.create({
      data: {
        organizationId: order.organizationId,
        type: CreditTxType.PURCHASE,
        amount: order.credits,
        balanceAfter: org.credits,
        description: `${label} kredi paketi`,
        referenceId: order.id,
      },
    });

    return { order: updated, alreadyCompleted: false as const };
  });
}
