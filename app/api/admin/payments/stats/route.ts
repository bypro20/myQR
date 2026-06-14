import { NextResponse } from "next/server";
import { fetchAdminSalesStats } from "@/lib/admin/payment-events";
import { requireAdminAnyPermissionApi } from "@/lib/tenant";

export async function GET() {
  const auth = await requireAdminAnyPermissionApi(["payments_view", "credits_manage"]);
  if (auth.error) return auth.error;

  const stats = await fetchAdminSalesStats();
  return NextResponse.json({ stats });
}
