import { NextRequest, NextResponse } from "next/server";
import { ActivityKind, PaymentStatus } from "@/app/generated/prisma/client";
import { logActivity } from "@/lib/admin/activity-log";
import { completePaymentOrder } from "@/lib/billing/complete-order";
import { requireAdminAnyPermissionApi } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminAnyPermissionApi(["payments_view", "credits_manage"]);
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const order = await prisma.paymentOrder.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    if (order.status === PaymentStatus.COMPLETED) {
      return NextResponse.json({ ok: true, alreadyCompleted: true });
    }

    if (
      order.status !== PaymentStatus.AWAITING_CONFIRMATION &&
      order.status !== PaymentStatus.PENDING
    ) {
      return NextResponse.json({ error: "Sipariş onaylanamaz." }, { status: 409 });
    }

    const result = await completePaymentOrder(id, `admin_${auth.user.id}`);
    void logActivity({
      kind: ActivityKind.PAYMENT_APPROVED,
      actorUserId: auth.user.id,
      actorRole: auth.user.role,
      organizationId: order.organizationId,
      targetType: "payment",
      targetId: order.id,
      targetLabel: order.packageId,
      message: `${auth.user.name} · ₺${order.amountTry} ödemeyi onayladı (+${order.credits} kr)`,
    });
    return NextResponse.json({ ok: true, orderId: result.order.id });
  } catch {
    return NextResponse.json({ error: "Onay başarısız." }, { status: 400 });
  }
}
