import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { completePaymentOrder } from "@/lib/billing/complete-order";

const schema = z.object({
  orderId: z.string().min(1),
  providerRef: z.string().optional(),
});

/** Called by payment provider after successful charge. Protect with PAYMENT_WEBHOOK_SECRET. */
export async function POST(req: NextRequest) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook yapılandırılmadı." }, { status: 503 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());
    const result = await completePaymentOrder(body.orderId, body.providerRef);
    return NextResponse.json({
      ok: true,
      orderId: result.order.id,
      alreadyCompleted: result.alreadyCompleted,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "WEBHOOK_FAILED";
    const status =
      message === "ORDER_NOT_FOUND" ? 404 : message === "ORDER_NOT_PAYABLE" ? 409 : 400;
    return NextResponse.json({ error: "Ödeme onaylanamadı." }, { status });
  }
}
