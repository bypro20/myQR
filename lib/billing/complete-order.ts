import { CreditTxType, PaymentStatus } from "@/app/generated/prisma/client";
import { getCreditPackage } from "@/lib/billing/packages";
import {
  getOrderLabel,
  getOrderPlan,
  isSubscriptionPackageId,
} from "@/lib/billing/order-catalog";
import { prisma } from "@/lib/prisma";

/** Idempotent: credits / subscription are applied only once when payment is confirmed. */
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

    const label = getOrderLabel(order.packageId);
    const subscriptionPlan = isSubscriptionPackageId(order.packageId)
      ? getOrderPlan(order.packageId)
      : null;

    const updated = await tx.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: PaymentStatus.COMPLETED,
        completedAt: new Date(),
        ...(providerRef ? { providerRef } : {}),
      },
    });

    if (subscriptionPlan) {
      const org = await tx.organization.update({
        where: { id: order.organizationId },
        data: {
          planTier: subscriptionPlan.id,
          subscriptionStatus: "ACTIVE",
          trialEndsAt: null,
          credits: { increment: subscriptionPlan.creditsMonthly },
        },
      });

      await tx.creditTransaction.create({
        data: {
          organizationId: order.organizationId,
          type: CreditTxType.PURCHASE,
          amount: subscriptionPlan.creditsMonthly,
          balanceAfter: org.credits,
          description: `${subscriptionPlan.name} abonelik · ilk ay kredisi`,
          referenceId: order.id,
        },
      });

      return { order: updated, alreadyCompleted: false as const };
    }

    const pkg = getCreditPackage(order.packageId);

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
        description: `${pkg?.name ?? label} kredi paketi`,
        referenceId: order.id,
      },
    });

    return { order: updated, alreadyCompleted: false as const };
  });
}
