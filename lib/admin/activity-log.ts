import { ActivityKind, PaymentStatus } from "@/app/generated/prisma/client";
import { getCreditPackage } from "@/lib/billing/packages";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";

export type ActivityFeedItem = {
  id: string;
  kind: ActivityKind | string;
  kindLabel: string;
  category: "qr" | "auth" | "payment" | "credit" | "user" | "org" | "admin" | "system";
  actor: { id?: string; name: string; email?: string; role?: string } | null;
  organization: { id: string; name: string } | null;
  targetType?: string;
  targetId?: string;
  targetLabel?: string;
  message: string;
  createdAt: string;
  href?: string;
};

export const ACTIVITY_KIND_LABELS: Record<ActivityKind, string> = {
  QR_CREATED: "QR oluşturma",
  QR_UPDATED: "QR güncelleme",
  QR_DELETED: "QR silme",
  USER_LOGIN: "Kullanıcı girişi",
  ADMIN_LOGIN: "Admin girişi",
  SIGNUP: "Yeni kayıt",
  PAYMENT_CREATED: "Ödeme talebi",
  PAYMENT_CLAIMED: "FAST ödeme bildirimi",
  PAYMENT_APPROVED: "Ödeme onayı",
  PAYMENT_CANCELLED: "Ödeme iptali",
  PAYMENT_REFUNDED: "Ödeme iadesi",
  PAYMENT_DELETED: "Ödeme silme",
  CREDIT_ADJUSTED: "Kredi işlemi",
  CREDIT_RESET: "Bakiye sıfırlama",
  USER_CREATED: "Kullanıcı oluşturma",
  USER_UPDATED: "Kullanıcı güncelleme",
  USER_DELETED: "Kullanıcı silme",
  ORG_UPDATED: "Organizasyon güncelleme",
  ADMIN_BULK_ACTION: "Toplu admin işlemi",
  STAFF_UPDATED: "Yetkili güncelleme",
  SECURITY_BLOCKED: "Güvenlik engeli",
  SECURITY_LOGIN_FAILED: "Başarısız giriş denemesi",
};

function kindCategory(kind: ActivityKind | string): ActivityFeedItem["category"] {
  if (kind.startsWith("QR_")) return "qr";
  if (kind.includes("LOGIN") || kind === "SIGNUP" || kind.startsWith("SECURITY_")) return "auth";
  if (kind.startsWith("PAYMENT_")) return "payment";
  if (kind.startsWith("CREDIT_")) return "credit";
  if (kind.startsWith("USER_")) return "user";
  if (kind.startsWith("ORG_")) return "org";
  if (kind.startsWith("ADMIN_") || kind === "STAFF_UPDATED") return "admin";
  return "system";
}

function hrefForItem(item: { kind: string; targetType?: string | null; targetId?: string | null }): string | undefined {
  if (item.kind.startsWith("QR_")) return "/admin/qr-codes";
  if (item.kind.startsWith("PAYMENT_")) return "/admin/sales";
  if (item.kind.startsWith("CREDIT_")) return "/admin/credits";
  if (item.kind.startsWith("USER_")) return "/admin/users";
  if (item.kind.startsWith("ORG_")) return "/admin/organizations";
  if (item.kind.includes("LOGIN") || item.kind === "SIGNUP") return "/admin/activity";
  return "/admin/activity";
}

type LogInput = {
  kind: ActivityKind;
  actorUserId?: string | null;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  organizationId?: string | null;
  targetType?: string;
  targetId?: string;
  targetLabel?: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export async function logActivity(input: LogInput) {
  try {
    let actorName = input.actorName;
    let actorEmail = input.actorEmail;
    let actorRole = input.actorRole;

    if (input.actorUserId && (!actorName || !actorEmail)) {
      const user = await prisma.user.findUnique({
        where: { id: input.actorUserId },
        select: { name: true, email: true, role: true },
      });
      if (user) {
        actorName = actorName || user.name;
        actorEmail = actorEmail || user.email;
        actorRole = actorRole || user.role;
      }
    }

    await prisma.activityLog.create({
      data: {
        kind: input.kind,
        actorUserId: input.actorUserId || undefined,
        actorName,
        actorEmail,
        actorRole,
        organizationId: input.organizationId || undefined,
        targetType: input.targetType,
        targetId: input.targetId,
        targetLabel: input.targetLabel,
        message: input.message,
        metadata: JSON.stringify(input.metadata || {}),
      },
    });
  } catch (err) {
    console.error("[logActivity]", err);
  }
}

function mapLogRow(row: {
  id: string;
  kind: ActivityKind;
  actorUserId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  organizationId: string | null;
  targetType: string | null;
  targetId: string | null;
  targetLabel: string | null;
  message: string;
  createdAt: Date;
  organization: { id: string; name: string } | null;
}): ActivityFeedItem {
  return {
    id: row.id,
    kind: row.kind,
    kindLabel: ACTIVITY_KIND_LABELS[row.kind] || row.kind,
    category: kindCategory(row.kind),
    actor: row.actorName
      ? { id: row.actorUserId || undefined, name: row.actorName, email: row.actorEmail || undefined, role: row.actorRole || undefined }
      : null,
    organization: row.organization,
    targetType: row.targetType || undefined,
    targetId: row.targetId || undefined,
    targetLabel: row.targetLabel || undefined,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    href: hrefForItem(row),
  };
}

async function buildSyntheticActivities(limit: number): Promise<ActivityFeedItem[]> {
  const [qrCodes, payments, signups, creditTxs] = await Promise.all([
    prisma.qrCode.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 40),
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            memberships: {
              where: { role: "OWNER" },
              take: 1,
              select: { user: { select: { id: true, name: true, email: true, role: true } } },
            },
          },
        },
      },
    }),
    prisma.paymentOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 30),
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            memberships: {
              where: { role: "OWNER" },
              take: 1,
              select: { user: { select: { id: true, name: true, email: true, role: true } } },
            },
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 20),
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.creditTransaction.findMany({
      where: { type: "ADMIN" },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 20),
      include: { organization: { select: { id: true, name: true } } },
    }),
  ]);

  const items: ActivityFeedItem[] = [];

  for (const qr of qrCodes) {
    const owner = qr.organization.memberships[0]?.user;
    items.push({
      id: `syn-qr-${qr.id}`,
      kind: ActivityKind.QR_CREATED,
      kindLabel: ACTIVITY_KIND_LABELS.QR_CREATED,
      category: "qr",
      actor: owner ? { id: owner.id, name: owner.name, email: owner.email, role: owner.role } : null,
      organization: { id: qr.organization.id, name: qr.organization.name },
      targetType: "qr",
      targetId: qr.id,
      targetLabel: qr.name,
      message: `${owner?.name || qr.organization.name} · "${qr.name}" (${qr.type}, ${qr.mode}) QR kodu oluşturdu`,
      createdAt: qr.createdAt.toISOString(),
      href: "/admin/qr-codes",
    });
  }

  for (const order of payments) {
    const owner = order.organization.memberships[0]?.user;
    const pkg = getCreditPackage(order.packageId);
    const pkgName = pkg?.name ?? order.packageId;
    const kind =
      order.status === PaymentStatus.COMPLETED
        ? ActivityKind.PAYMENT_APPROVED
        : order.status === PaymentStatus.FAILED
          ? ActivityKind.PAYMENT_CANCELLED
          : order.status === PaymentStatus.REFUNDED
            ? ActivityKind.PAYMENT_REFUNDED
            : order.status === PaymentStatus.AWAITING_CONFIRMATION
              ? ActivityKind.PAYMENT_CLAIMED
              : ActivityKind.PAYMENT_CREATED;
    items.push({
      id: `syn-pay-${order.id}`,
      kind,
      kindLabel: ACTIVITY_KIND_LABELS[kind],
      category: "payment",
      actor: owner ? { id: owner.id, name: owner.name, email: owner.email, role: owner.role } : null,
      organization: { id: order.organization.id, name: order.organization.name },
      targetType: "payment",
      targetId: order.id,
      targetLabel: pkgName,
      message: `${owner?.name || order.organization.name} · ${pkgName} (₺${order.amountTry.toLocaleString("tr-TR")}, ${order.credits} kr) — ${order.status}`,
      createdAt: (order.completedAt || order.createdAt).toISOString(),
      href: "/admin/sales",
    });
  }

  for (const u of signups) {
    items.push({
      id: `syn-signup-${u.id}`,
      kind: ActivityKind.SIGNUP,
      kindLabel: ACTIVITY_KIND_LABELS.SIGNUP,
      category: "auth",
      actor: { id: u.id, name: u.name, email: u.email, role: u.role },
      organization: null,
      targetType: "user",
      targetId: u.id,
      targetLabel: u.name,
      message: `${u.name} (${u.email}) platforma kayıt oldu`,
      createdAt: u.createdAt.toISOString(),
      href: "/admin/users",
    });
  }

  for (const tx of creditTxs) {
    items.push({
      id: `syn-credit-${tx.id}`,
      kind: ActivityKind.CREDIT_ADJUSTED,
      kindLabel: ACTIVITY_KIND_LABELS.CREDIT_ADJUSTED,
      category: "credit",
      actor: null,
      organization: tx.organization,
      targetType: "credit",
      targetId: tx.id,
      targetLabel: tx.description,
      message: `${tx.organization.name} · ${tx.description} (${tx.amount >= 0 ? "+" : ""}${tx.amount} kr)`,
      createdAt: tx.createdAt.toISOString(),
      href: "/admin/credits",
    });
  }

  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export async function fetchActivityFeed(options: {
  limit?: number;
  since?: Date | null;
  kind?: string;
  actorUserId?: string;
  includeSynthetic?: boolean;
}) {
  const limit = Math.min(options.limit || 80, 200);
  const where: Record<string, unknown> = {};
  if (options.since && !Number.isNaN(options.since.getTime())) {
    where.createdAt = { gt: options.since };
  }
  if (options.kind) where.kind = options.kind;
  if (options.actorUserId) where.actorUserId = options.actorUserId;

  let items: ActivityFeedItem[] = [];
  try {
    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { organization: { select: { id: true, name: true } } },
    });
    items = logs.map(mapLogRow);
  } catch {
    items = [];
  }

  if (!options.since && options.includeSynthetic !== false && items.length < limit) {
    const synthetic = await buildSyntheticActivities(limit);
    const seen = new Set(items.map((i) => `${i.kind}-${i.targetId}`));
    for (const s of synthetic) {
      const key = `${s.kind}-${s.targetId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(s);
    }
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    items = items.slice(0, limit);
  }

  return items;
}

export async function fetchActiveUsers(minutes = 30) {
  const since = new Date(Date.now() - minutes * 60_000);
  const users = await prisma.user.findMany({
    where: { lastLoginAt: { gte: since }, isActive: true },
    orderBy: { lastLoginAt: "desc" },
    take: 20,
    select: { id: true, name: true, email: true, role: true, lastLoginAt: true },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    lastLoginAt: u.lastLoginAt?.toISOString() || null,
  }));
}

export async function fetchActivityStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [todayLogs, qrToday, paymentsToday, activeUsers] = await Promise.all([
    prisma.activityLog.count({ where: { createdAt: { gte: startOfDay } } }).catch(() => 0),
    prisma.qrCode.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.paymentOrder.count({ where: { createdAt: { gte: startOfDay } } }),
    fetchActiveUsers(60),
  ]);

  return {
    todayEvents: todayLogs,
    todayQrCreated: qrToday,
    todayPayments: paymentsToday,
    activeUsersCount: activeUsers.length,
    activeUsers,
  };
}

export function isActivityAfterSince(item: ActivityFeedItem, since: Date) {
  return new Date(item.createdAt) > since;
}

const PAYMENT_KINDS: ActivityKind[] = [
  "PAYMENT_CREATED",
  "PAYMENT_CLAIMED",
  "PAYMENT_APPROVED",
  "PAYMENT_CANCELLED",
  "PAYMENT_REFUNDED",
  "PAYMENT_DELETED",
];

const CREDIT_KINDS: ActivityKind[] = ["CREDIT_ADJUSTED", "CREDIT_RESET"];

const AUTH_KINDS: ActivityKind[] = ["USER_LOGIN", "ADMIN_LOGIN", "SIGNUP"];

const QR_KINDS: ActivityKind[] = ["QR_CREATED", "QR_UPDATED", "QR_DELETED"];

export async function clearActivityLogs(options: {
  kinds?: ActivityKind[];
  kind?: ActivityKind;
  all?: boolean;
}) {
  if (options.all) {
    const result = await prisma.activityLog.deleteMany({});
    return result.count;
  }
  if (options.kind) {
    const result = await prisma.activityLog.deleteMany({ where: { kind: options.kind } });
    return result.count;
  }
  if (options.kinds?.length) {
    const result = await prisma.activityLog.deleteMany({ where: { kind: { in: options.kinds } } });
    return result.count;
  }
  return 0;
}

export function activityKindsForCategory(category: "payment" | "credit" | "auth" | "qr") {
  if (category === "payment") return PAYMENT_KINDS;
  if (category === "credit") return CREDIT_KINDS;
  if (category === "auth") return AUTH_KINDS;
  return QR_KINDS;
}
