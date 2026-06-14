import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PaymentStatus } from "@/app/generated/prisma/client";
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

    const meta = JSON.parse(order.metadata || "{}") as Record<string, unknown>;
    await prisma.paymentOrder.update({
      where: { id: order.id },
      data: {
        status: PaymentStatus.AWAITING_CONFIRMATION,
        metadata: JSON.stringify({
          ...meta,
          claimedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      ok: true,
      message:
        "Ödeme bildiriminiz alındı. FAST transferi kontrol edildikten sonra krediler yüklenecektir.",
    });
  } catch {
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 400 });
  }
}
