import { NextRequest, NextResponse } from "next/server";
import { PaymentStatus, UserRole } from "@/app/generated/prisma/client";
import { requireAdminAnyPermissionApi } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

const ADMIN_PERMS = ["payments_view", "credits_manage"] as const;

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminAnyPermissionApi([...ADMIN_PERMS]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const force = req.nextUrl.searchParams.get("force") === "true";

  try {
    const order = await prisma.paymentOrder.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    if (order.status === PaymentStatus.COMPLETED || order.status === PaymentStatus.REFUNDED) {
      if (!force) {
        return NextResponse.json(
          {
            error:
              order.status === PaymentStatus.COMPLETED
                ? "Tamamlanan siparişler silinemez. İade edin veya zorla silmek için force=true kullanın."
                : "İade edilmiş sipariş silinemez.",
          },
          { status: 409 },
        );
      }
      if (auth.user.role !== UserRole.SUPER_ADMIN) {
        return NextResponse.json(
          { error: "Tamamlanan/iade kayıtları yalnızca süper admin tarafından silinebilir." },
          { status: 403 },
        );
      }
    }

    await prisma.paymentOrder.delete({ where: { id } });

    return NextResponse.json({ ok: true, deleted: true });
  } catch {
    return NextResponse.json({ error: "Silme başarısız." }, { status: 400 });
  }
}
