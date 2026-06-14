import { NextResponse } from "next/server";
import { getUserAdminPermissions, userHasAnyPermission } from "@/lib/admin-permissions";
import { requirePlatformAdminApi } from "@/lib/tenant";
import { getGoogleAdsAdminStatus } from "@/lib/admin/google-ads-status";

export async function GET() {
  const auth = await requirePlatformAdminApi();
  if (auth.error) return auth.error;

  const perms = getUserAdminPermissions(auth.user);
  if (!userHasAnyPermission(auth.user, ["payments_view", "overview"])) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }

  const dailyBudget = Number(process.env.GOOGLE_ADS_DAILY_BUDGET_TRY || "150");
  return NextResponse.json(getGoogleAdsAdminStatus(dailyBudget));
}
