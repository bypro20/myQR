import { NextRequest, NextResponse } from "next/server";
import { PaymentStatus } from "@/app/generated/prisma/client";
import { requireAdminAnyPermissionApi } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";

type RouteParams = { params: Promise<{ id: string }> };

const ADMIN_PERMS = ["payments_view", "credits_manage"] as const;

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminAnyPermissionApi([...ADMIN_PERMS]);
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const order = await prisma.paymentOrder.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    if (order.status === PaymentStatus.COMPLETED) {
      return NextResponse.json({ error: "Tamamlanan sipariş iptal edilemez." }, { status: 409 });
    }

    if (order.status === PaymentStatus.FAILED || order.status === PaymentStatus.REFUNDED) {
      return NextResponse.json({ ok: true, alreadyCancelled: true });
    }

    if (
      order.status !== PaymentStatus.PENDING &&
      order.status !== PaymentStatus.AWAITING_CONFIRMATION
    ) {
      return NextResponse.json({ error: "Sipariş iptal edilemez." }, { status: 409 });
    }

    const meta = parseJson<Record<string, unknown>>(order.metadata, {});
    await prisma.paymentOrder.update({
      where: { id },
      data: {
        status: PaymentStatus.FAILED,
        metadata: JSON.stringify({
          ...meta,
          cancelledAt: new Date().toISOString(),
          cancelledBy: auth.user.id,
          cancelReason: "admin_rejected",
        }),
      },
    });

    return NextResponse.json({ ok: true, orderId: id, status: "FAILED" });
  } catch {
    return NextResponse.json({ error: "İptal başarısız." }, { status: 400 });
  }
}
