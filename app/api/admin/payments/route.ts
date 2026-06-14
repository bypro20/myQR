import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PaymentStatus } from "@/app/generated/prisma/client";
import {
  cancelAllPendingPayments,
  deletePaymentsByStatus,
  resetPaymentHistory,
} from "@/lib/admin/payment-actions";
import { fetchAdminPaymentEvents } from "@/lib/admin/payment-events";
import { requireAdminAnyPermissionApi } from "@/lib/tenant";

const ADMIN_PERMS = ["payments_view", "credits_manage"] as const;

export async function GET(req: NextRequest) {
  const auth = await requireAdminAnyPermissionApi([...ADMIN_PERMS]);
  if (auth.error) return auth.error;

  const status = req.nextUrl.searchParams.get("status");
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 100), 500);

  const list = await fetchAdminPaymentEvents(limit);
  const filtered =
    status && status in PaymentStatus
      ? list.filter((e) => e.status === status)
      : list;

  return NextResponse.json({ payments: filtered, total: filtered.length });
}

const bulkSchema = z.object({
  action: z.enum([
    "cancel_all_pending",
    "delete_failed",
    "delete_cancelled",
    "delete_non_completed",
    "reset_payment_history",
    "clear_all_payments",
  ]),
  confirm: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireAdminAnyPermissionApi([...ADMIN_PERMS]);
  if (auth.error) return auth.error;

  try {
    const body = bulkSchema.parse(await req.json());

    if (body.action === "cancel_all_pending") {
      const count = await cancelAllPendingPayments(auth.user.id);
      return NextResponse.json({ ok: true, action: body.action, count });
    }

    if (body.action === "delete_failed") {
      const count = await deletePaymentsByStatus([PaymentStatus.FAILED]);
      return NextResponse.json({ ok: true, action: body.action, count });
    }

    if (body.action === "delete_cancelled") {
      const count = await deletePaymentsByStatus([PaymentStatus.FAILED]);
      return NextResponse.json({ ok: true, action: body.action, count });
    }

    if (body.action === "delete_non_completed") {
      const count = await deletePaymentsByStatus([
        PaymentStatus.PENDING,
        PaymentStatus.AWAITING_CONFIRMATION,
        PaymentStatus.FAILED,
      ]);
      return NextResponse.json({ ok: true, action: body.action, count });
    }

    if (body.action === "reset_payment_history") {
      if (body.confirm !== "SIFIRLA") {
        return NextResponse.json(
          { error: "Onay için confirm: 'SIFIRLA' gönderin." },
          { status: 400 },
        );
      }
      const count = await resetPaymentHistory({ includeCompleted: true });
      return NextResponse.json({ ok: true, action: body.action, count });
    }

    if (body.action === "clear_all_payments") {
      if (body.confirm !== "SIFIRLA") {
        return NextResponse.json(
          { error: "Onay için confirm: 'SIFIRLA' gönderin." },
          { status: 400 },
        );
      }
      const count = await resetPaymentHistory({ includeCompleted: true });
      return NextResponse.json({ ok: true, action: body.action, count });
    }

    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }
    return NextResponse.json({ error: "Toplu işlem başarısız." }, { status: 500 });
  }
}
