import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ActivityKind } from "@/app/generated/prisma/client";
import {
  activityKindsForCategory,
  clearActivityLogs,
  fetchActiveUsers,
  fetchActivityFeed,
  fetchActivityStats,
  isActivityAfterSince,
  logActivity,
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

const postSchema = z.object({
  action: z.enum([
    "clear_all",
    "clear_kind",
    "clear_payment",
    "clear_credit",
    "clear_auth",
    "clear_qr",
  ]),
  kind: z.string().optional(),
  confirm: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireAdminAnyPermissionApi([...PERMS]);
  if (auth.error) return auth.error;

  try {
    const body = postSchema.parse(await req.json());
    let count = 0;

    if (body.action === "clear_all") {
      if (body.confirm !== "SIFIRLA") {
        return NextResponse.json({ error: "Onay için confirm: 'SIFIRLA' gönderin." }, { status: 400 });
      }
      count = await clearActivityLogs({ all: true });
    } else if (body.action === "clear_kind") {
      const validKinds = new Set(Object.values(ActivityKind));
      if (!body.kind || !validKinds.has(body.kind as ActivityKind)) {
        return NextResponse.json({ error: "Geçersiz aktivite türü." }, { status: 400 });
      }
      count = await clearActivityLogs({ kind: body.kind as ActivityKind });
    } else if (body.action === "clear_payment") {
      count = await clearActivityLogs({ kinds: activityKindsForCategory("payment") });
    } else if (body.action === "clear_credit") {
      count = await clearActivityLogs({ kinds: activityKindsForCategory("credit") });
    } else if (body.action === "clear_auth") {
      count = await clearActivityLogs({ kinds: activityKindsForCategory("auth") });
    } else if (body.action === "clear_qr") {
      count = await clearActivityLogs({ kinds: activityKindsForCategory("qr") });
    }

    void logActivity({
      kind: ActivityKind.ADMIN_BULK_ACTION,
      actorUserId: auth.user.id,
      actorName: auth.user.name,
      message: `${auth.user.name} · ${count} aktivite kaydı temizlendi (${body.action})`,
      metadata: { action: body.action, count },
    });

    return NextResponse.json({ ok: true, count });
  } catch {
    return NextResponse.json({ error: "Temizleme başarısız." }, { status: 400 });
  }
}
