import { NextRequest, NextResponse } from "next/server";
import {
  fetchActiveUsers,
  fetchActivityFeed,
  fetchActivityStats,
  isActivityAfterSince,
} from "@/lib/admin/activity-log";
import { requireAdminAnyPermissionApi } from "@/lib/tenant";

/** Platform canlı aktivitesi — yalnızca admin paneli (activity_view) */
const PERMS = ["activity_view"] as const;

export async function GET(req: NextRequest) {
  const auth = await requireAdminAnyPermissionApi([...PERMS]);
  if (auth.error) return auth.error;

  const sinceRaw = req.nextUrl.searchParams.get("since");
  const since = sinceRaw ? new Date(sinceRaw) : null;
  const kind = req.nextUrl.searchParams.get("kind") || undefined;
  const actorUserId = req.nextUrl.searchParams.get("actorUserId") || undefined;
  const limit = Number(req.nextUrl.searchParams.get("limit") || 80);

  const [activities, stats, activeUsers] = await Promise.all([
    fetchActivityFeed({ limit, since: since && !Number.isNaN(since.getTime()) ? since : null, kind, actorUserId }),
    fetchActivityStats(),
    fetchActiveUsers(60),
  ]);

  const newActivities =
    since && !Number.isNaN(since.getTime())
      ? activities.filter((a) => isActivityAfterSince(a, since))
      : [];

  return NextResponse.json({
    activities,
    newActivities,
    stats,
    activeUsers,
    serverTime: new Date().toISOString(),
  });
}
