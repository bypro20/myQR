import { NextResponse } from "next/server";
import { fetchAdminPaymentEvents } from "@/lib/admin/payment-events";
import { getCreditPackage } from "@/lib/billing/packages";
import { requireAdminAnyPermissionApi } from "@/lib/tenant";

const ADMIN_PERMS = ["payments_view", "credits_manage"] as const;

export async function GET() {
  const auth = await requireAdminAnyPermissionApi([...ADMIN_PERMS]);
  if (auth.error) return auth.error;

  const events = await fetchAdminPaymentEvents(500);

  const header = "ID,Kullanıcı,E-posta,Organizasyon,Paket,Tutar,Kredi,Durum,Sağlayıcı,Oluşturma,Tamamlanma\n";
  const rows = events.map((e) => {
    const pkg = getCreditPackage(e.packageId);
    const cols = [
      e.orderId,
      e.customer?.name || e.organization.name,
      e.customer?.email || "",
      e.organization.name,
      pkg?.name ?? e.packageId,
      e.amountTry,
      e.credits,
      e.status,
      e.provider,
      e.createdAt,
      e.completedAt || "",
    ];
    return cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",");
  });

  const csv = header + rows.join("\n");
  const filename = `myqr-odemeler-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
