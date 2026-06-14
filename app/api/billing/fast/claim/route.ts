import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ActivityKind, PaymentStatus } from "@/app/generated/prisma/client";
import { logActivity } from "@/lib/admin/activity-log";
import { getOrderLabel, getOrderType } from "@/lib/billing/order-catalog";
import { requireTenantApi } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

const schema = z.object({ orderId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const auth = await requireTenantApi();
  if (auth.error) return auth.error;

  try {
    const { orderId } = schema.parse(await req.json());

    const order = await prisma.paymentOrder.findFirst({
      where: {
        id: orderId,
        organizationId: auth.organization.id,
        provider: { in: ["checkout", "fast_transfer"] },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    if (order.status === PaymentStatus.COMPLETED) {
      return NextResponse.json({ ok: true, alreadyCompleted: true });
    }

    if (order.status !== PaymentStatus.PENDING) {
      return NextResponse.json({ error: "Bu sipariş için bildirim alınamadı." }, { status: 409 });
    }

    const claimedAt = new Date().toISOString();
    const meta = JSON.parse(order.metadata || "{}") as Record<string, unknown>;
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: PaymentStatus.AWAITING_CONFIRMATION,
        metadata: JSON.stringify({
          ...meta,
          claimedAt,
        }),
      },
    });

    const orderType = getOrderType(order.packageId);
    const label = getOrderLabel(order.packageId);

    void logActivity({
      kind: ActivityKind.PAYMENT_CLAIMED,
      actorUserId: auth.user.id,
      organizationId: auth.organization.id,
      targetType: "payment",
      targetId: order.id,
      targetLabel: label,
      message: `${auth.user.name} · ${label} için FAST ödeme bildirdi (₺${order.amountTry.toLocaleString("tr-TR")})`,
      metadata: { orderType, amountTry: order.amountTry, claimedAt },
    });

    return NextResponse.json({
      ok: true,
      message:
        orderType === "subscription"
          ? "Ödeme bildiriminiz alındı. FAST transferi kontrol edildikten sonra aboneliğiniz aktif edilecektir."
          : "Ödeme bildiriminiz alındı. FAST transferi kontrol edildikten sonra krediler yüklenecektir.",
    });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 400 });
  }
}
