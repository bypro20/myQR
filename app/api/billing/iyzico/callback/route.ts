import { NextRequest, NextResponse } from "next/server";
import { PaymentStatus } from "@/app/generated/prisma/client";
import { completePaymentOrder } from "@/lib/billing/complete-order";
import { retrieveIyzicoCheckout } from "@/lib/billing/iyzico/client";
import { getAppBaseUrl } from "@/lib/billing/posnet/config";
import { prisma } from "@/lib/prisma";

function redirect(status: "success" | "failed", msg?: string) {
  const params = new URLSearchParams({ payment: status });
  if (msg) params.set("msg", msg.slice(0, 120));
  return NextResponse.redirect(`${getAppBaseUrl()}/dashboard/billing?${params}`, 303);
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const token = String(form.get("token") || "");

    if (!token) {
      return redirect("failed", "Ödeme token eksik.");
    }

    const orders = await prisma.paymentOrder.findMany({
      where: { status: PaymentStatus.PENDING, provider: "iyzico" },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const order = orders.find((o) => {
      try {
        const meta = JSON.parse(o.metadata || "{}") as { iyzicoToken?: string };
        return meta.iyzicoToken === token;
      } catch {
        return false;
      }
    });

    if (!order) {
      return redirect("failed", "Sipariş bulunamadı.");
    }

    const result = await retrieveIyzicoCheckout(token);

    if (result.status !== "success" || result.paymentStatus !== "SUCCESS") {
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: { status: PaymentStatus.FAILED },
      });
      return redirect("failed", result.errorMessage || "Kart ödemesi onaylanmadı.");
    }

    await completePaymentOrder(order.id, result.paymentId || token);
    return redirect("success");
  } catch (err) {
    console.error(err);
    return redirect("failed", "Ödeme işlenirken hata oluştu.");
  }
}
