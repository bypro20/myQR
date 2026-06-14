import { NextRequest, NextResponse } from "next/server";
import {
  fetchAdminPaymentEvents,
  fetchAdminSalesStats,
  fetchPendingPaymentEvents,
  isEventAfterSince,
} from "@/lib/admin/payment-events";
import {
  fetchActivityFeed,
  isActivityAfterSince,
} from "@/lib/admin/activity-log";
import { userHasPermission } from "@/lib/admin-permissions";
import { requireAdminAnyPermissionApi } from "@/lib/tenant";

const PERMS = ["payments_view", "credits_manage", "organizations_manage", "overview", "activity_view"] as const;

export async function GET(req: NextRequest) {
  const auth = await requireAdminAnyPermissionApi([...PERMS]);
  if (auth.error) return auth.error;

  const sinceRaw = req.nextUrl.searchParams.get("since");
  const since = sinceRaw ? new Date(sinceRaw) : null;
  const canViewActivity = userHasPermission(auth.user, "activity_view");

  const [events, pending, stats, activities] = await Promise.all([
    fetchAdminPaymentEvents(80),
    fetchPendingPaymentEvents(),
    fetchAdminSalesStats(),
    canViewActivity
      ? fetchActivityFeed({ limit: 40, includeSynthetic: false })
      : Promise.resolve([]),
  ]);

  const newEvents =
    since && !Number.isNaN(since.getTime())
      ? events.filter((e) => isEventAfterSince(e, since))
      : [];

  const newActivities =
    since && !Number.isNaN(since.getTime())
      ? activities.filter((a) => isActivityAfterSince(a, since))
      : [];

  const needsAction = pending.filter(
    (p) => p.status === "AWAITING_CONFIRMATION" || p.status === "PENDING",
  );

  return NextResponse.json({
    events,
    newEvents,
    activities,
    newActivities,
    pending: needsAction,
    stats,
    canViewActivity,
    serverTime: new Date().toISOString(),
  });
}
