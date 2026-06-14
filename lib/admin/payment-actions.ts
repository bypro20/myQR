import { CreditTxType, PaymentStatus, ActivityKind } from "@/app/generated/prisma/client";
import { getCreditPackage } from "@/lib/billing/packages";
import { logActivity } from "@/lib/admin/activity-log";
import { parseJson } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export async function refundPaymentOrder(
  orderId: string,
  adminUserId: string,
  deductCredits = true,
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.paymentOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.status !== PaymentStatus.COMPLETED) throw new Error("NOT_REFUNDABLE");

    if (deductCredits && order.credits > 0) {
      const org = await tx.organization.findUniqueOrThrow({ where: { id: order.organizationId } });
      if (!org.unlimitedCredits) {
        const deduct = Math.min(org.credits, order.credits);
        const updated = await tx.organization.update({
          where: { id: order.organizationId },
          data: { credits: { decrement: deduct } },
        });
        const pkg = getCreditPackage(order.packageId);
        await tx.creditTransaction.create({
          data: {
            organizationId: order.organizationId,
            type: CreditTxType.REFUND,
            amount: -deduct,
            balanceAfter: updated.credits,
            description: `${pkg?.name ?? order.packageId} iadesi`,
            referenceId: order.id,
          },
        });
      }
    }

    const meta = parseJson<Record<string, unknown>>(order.metadata, {});
    const updatedOrder = await tx.paymentOrder.update({
      where: { id: orderId },
      data: {
        status: PaymentStatus.REFUNDED,
        metadata: JSON.stringify({
          ...meta,
          refundedAt: new Date().toISOString(),
          refundedBy: adminUserId,
        }),
      },
    });

    return updatedOrder;
  }).then((order) => {
    void logActivity({
      kind: ActivityKind.PAYMENT_REFUNDED,
      actorUserId: adminUserId,
      organizationId: order.organizationId,
      targetType: "payment",
      targetId: order.id,
      targetLabel: order.packageId,
      message: `Admin · ₺${order.amountTry} ödeme iadesi yapıldı`,
    });
    return order;
  });
}

export async function cancelAllPendingPayments(adminUserId: string) {
  const pending = await prisma.paymentOrder.findMany({
    where: { status: { in: [PaymentStatus.PENDING, PaymentStatus.AWAITING_CONFIRMATION] } },
  });

  let count = 0;
  for (const order of pending) {
    const meta = parseJson<Record<string, unknown>>(order.metadata, {});
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: PaymentStatus.FAILED,
        metadata: JSON.stringify({
          ...meta,
          cancelledAt: new Date().toISOString(),
          cancelledBy: adminUserId,
          cancelReason: "admin_bulk_cancel",
        }),
      },
    });
    count++;
  }
  return count;
}

export async function deletePaymentsByStatus(statuses: PaymentStatus[]) {
  const result = await prisma.paymentOrder.deleteMany({
    where: { status: { in: statuses } },
  });
  return result.count;
}

export async function resetPaymentHistory(options: { includeCompleted: boolean }) {
  if (options.includeCompleted) {
    const result = await prisma.paymentOrder.deleteMany({});
    return result.count;
  }
  const result = await prisma.paymentOrder.deleteMany({
    where: {
      status: {
        in: [PaymentStatus.PENDING, PaymentStatus.AWAITING_CONFIRMATION, PaymentStatus.FAILED],
      },
    },
  });
  return result.count;
}

export async function resetCreditTransactions(scope: { organizationId?: string }) {
  if (scope.organizationId) {
    const result = await prisma.creditTransaction.deleteMany({
      where: { organizationId: scope.organizationId },
    });
    return result.count;
  }
  const result = await prisma.creditTransaction.deleteMany({});
  return result.count;
}

export async function resetAllBalances() {
  const orgs = await prisma.organization.findMany({
    where: { unlimitedCredits: false },
    select: { id: true, credits: true },
  });

  let count = 0;
  for (const org of orgs) {
    if (org.credits === 0) continue;
    await prisma.$transaction(async (tx) => {
      const updated = await tx.organization.update({
        where: { id: org.id },
        data: { credits: 0 },
      });
      await tx.creditTransaction.create({
        data: {
          organizationId: org.id,
          type: CreditTxType.ADMIN,
          amount: -org.credits,
          balanceAfter: updated.credits,
          description: "Admin: tüm bakiye sıfırlandı",
        },
      });
    });
    count++;
  }
  return count;
}
