import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { PaymentStatus } from "@/app/generated/prisma/client";
import { getCreditPackage } from "@/lib/billing/packages";
import { getFastPaymentConfig } from "@/lib/billing/fast/config";
import { buildFastTrKarekodPayload } from "@/lib/billing/fast/tr-karekod";
import { prisma } from "@/lib/prisma";
import { requireTenantApi } from "@/lib/tenant";

type RouteParams = { params: Promise<{ orderId: string }> };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireTenantApi();
  if (auth.error) return auth.error;

  const { orderId } = await params;
  const order = await prisma.paymentOrder.findFirst({
    where: {
      id: orderId,
      organizationId: auth.organization.id,
      provider: { in: ["checkout", "fast_transfer"] },
    },
  });

  if (!order || order.status === PaymentStatus.FAILED) {
    return new NextResponse("Not found", { status: 404 });
  }

  const meta = JSON.parse(order.metadata || "{}") as { referenceCode?: string };
  const cfg = getFastPaymentConfig();
  const payload = buildFastTrKarekodPayload({
    iban: cfg.iban,
    amountTry: order.amountTry,
    merchantName: cfg.accountName,
    referenceCode: meta.referenceCode || order.id,
  });

  const png = await QRCode.toBuffer(payload, {
    type: "png",
    width: 320,
    margin: 4,
    errorCorrectionLevel: "M",
    color: { dark: "#111827", light: "#ffffff" },
  });
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-store",
    },
  });
}
