import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { refundPaymentOrder } from "@/lib/admin/payment-actions";
import { requireAdminAnyPermissionApi } from "@/lib/tenant";

type RouteParams = { params: Promise<{ id: string }> };

const ADMIN_PERMS = ["payments_view", "credits_manage"] as const;

const refundSchema = z.object({
  deductCredits: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminAnyPermissionApi([...ADMIN_PERMS]);
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const body = refundSchema.parse(await req.json().catch(() => ({})));
    const order = await refundPaymentOrder(id, auth.user.id, body.deductCredits);
    return NextResponse.json({ ok: true, orderId: order.id, status: order.status });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }
    if (err instanceof Error && err.message === "ORDER_NOT_FOUND") {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }
    if (err instanceof Error && err.message === "NOT_REFUNDABLE") {
      return NextResponse.json({ error: "Sadece tamamlanan siparişler iade edilebilir." }, { status: 409 });
    }
    return NextResponse.json({ error: "İade başarısız." }, { status: 400 });
  }
}
