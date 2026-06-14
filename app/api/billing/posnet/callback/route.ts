import { NextRequest, NextResponse } from "next/server";
import { PaymentStatus } from "@/app/generated/prisma/client";
import { completePaymentOrder } from "@/lib/billing/complete-order";
import { getAppBaseUrl } from "@/lib/billing/posnet/config";
import { finalizePosnetPayment } from "@/lib/billing/posnet/oos";
import { prisma } from "@/lib/prisma";

function billingRedirect(status: "success" | "failed" | "cancelled", message?: string) {
  const base = `${getAppBaseUrl()}/dashboard/billing`;
  const params = new URLSearchParams({ payment: status });
  if (message) params.set("msg", message.slice(0, 120));
  return NextResponse.redirect(`${base}?${params.toString()}`, 303);
}

async function readCallbackPayload(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    return {
      bankPacket: String(form.get("BankPacket") || form.get("bankData") || ""),
      merchantPacket: String(form.get("MerchantPacket") || form.get("merchantData") || ""),
      sign: String(form.get("Sign") || form.get("sign") || ""),
      xid: String(form.get("Xid") || form.get("xid") || form.get("XID") || ""),
    };
  }

  const url = new URL(req.url);
  return {
    bankPacket: url.searchParams.get("BankPacket") || url.searchParams.get("bankData") || "",
    merchantPacket: url.searchParams.get("MerchantPacket") || url.searchParams.get("merchantData") || "",
    sign: url.searchParams.get("Sign") || url.searchParams.get("sign") || "",
    xid: url.searchParams.get("Xid") || url.searchParams.get("xid") || url.searchParams.get("XID") || "",
  };
}

async function handleCallback(req: NextRequest) {
  try {
    const payload = await readCallbackPayload(req);
    if (!payload.bankPacket || !payload.merchantPacket || !payload.sign) {
      return billingRedirect("failed", "Banka dönüş verisi eksik.");
    }

    const orders = await prisma.paymentOrder.findMany({
      where: { status: PaymentStatus.PENDING, provider: "yapikredi_posnet_oos" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const order = orders.find((o) => {
      try {
        const meta = JSON.parse(o.metadata || "{}") as { posnetXid?: string };
        if (payload.xid) return meta.posnetXid === payload.xid;
        return false;
      } catch {
        return false;
      }
    });

    if (!order) {
      return billingRedirect("failed", "Sipariş bulunamadı.");
    }

    const meta = JSON.parse(order.metadata || "{}") as {
      posnetXid?: string;
      amountKurus?: string;
    };

    if (!meta.posnetXid || !meta.amountKurus) {
      return billingRedirect("failed", "Sipariş meta verisi eksik.");
    }

    const result = await finalizePosnetPayment({
      xid: meta.posnetXid,
      amountKurus: meta.amountKurus,
      bankPacket: payload.bankPacket,
      merchantPacket: payload.merchantPacket,
      sign: payload.sign,
    });

    if (!result.approved) {
      await prisma.paymentOrder.update({
        where: { id: order.id },
        data: { status: PaymentStatus.FAILED },
      });
      return billingRedirect("failed", result.respText || "Ödeme onaylanmadı.");
    }

    await completePaymentOrder(order.id, result.hostlogkey || result.authCode || undefined);
    return billingRedirect("success");
  } catch (err) {
    console.error(err);
    return billingRedirect("failed", "Ödeme işlenirken hata oluştu.");
  }
}

export async function POST(req: NextRequest) {
  return handleCallback(req);
}

export async function GET(req: NextRequest) {
  return handleCallback(req);
}
