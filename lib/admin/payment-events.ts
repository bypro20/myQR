import { PaymentOrder, PaymentStatus } from "@/app/generated/prisma/client";
import {
  getOrderLabel,
  getOrderType,
  type BillingOrderType,
} from "@/lib/billing/order-catalog";
import { parseJson } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export type AdminPaymentEvent = {
  id: string;
  kind: "created" | "claimed" | "completed";
  orderId: string;
  status: PaymentStatus;
  amountTry: number;
  credits: number;
  packageId: string;
  packageName: string;
  orderType: BillingOrderType;
  orderTypeLabel: string;
  provider: string;
  createdAt: string;
  completedAt: string | null;
  claimedAt: string | null;
  customer: { id: string; name: string; email: string } | null;
  organization: { id: string; name: string; slug: string; credits: number; unlimitedCredits: boolean };
  message: string;
};

type OrderWithOrg = PaymentOrder & {
  organization: {
    id: string;
    name: string;
    slug: string;
    credits: number;
    unlimitedCredits: boolean;
    memberships: Array<{ user: { id: string; name: string; email: string } }>;
  };
};

const ORDER_TYPE_LABELS: Record<BillingOrderType, string> = {
  credits: "Kredi paketi",
  subscription: "Abonelik",
};

function orderClaimedAt(order: PaymentOrder): string | null {
  const meta = parseJson<Record<string, unknown>>(order.metadata, {});
  const claimed = meta.claimedAt;
  return typeof claimed === "string" ? claimed : null;
}

function eventKind(order: PaymentOrder, claimedAt: string | null): AdminPaymentEvent["kind"] {
  if (order.status === PaymentStatus.COMPLETED) return "completed";
  if (order.status === PaymentStatus.AWAITING_CONFIRMATION || claimedAt) return "claimed";
  return "created";
}

function eventMessage(
  kind: AdminPaymentEvent["kind"],
  customerName: string,
  pkgName: string,
  amountTry: number,
  orderType: BillingOrderType,
) {
  const amount = `₺${amountTry.toLocaleString("tr-TR")}`;
  if (kind === "completed") {
    if (orderType === "subscription") {
      return `${customerName} · ${pkgName} aboneliği aktif edildi (${amount})`;
    }
    return `${customerName} · ${pkgName} satın aldı (${amount})`;
  }
  if (kind === "claimed") {
    if (orderType === "subscription") {
      return `${customerName} · ${pkgName} için FAST ödeme bildirdi (${amount})`;
    }
    return `${customerName} · ${pkgName} için FAST ödeme bildirdi (${amount})`;
  }
  if (orderType === "subscription") {
    return `${customerName} · ${pkgName} abonelik siparişi başlattı (${amount})`;
  }
  return `${customerName} · ${pkgName} siparişi başlattı (${amount})`;
}

export function mapPaymentOrderToEvent(order: OrderWithOrg): AdminPaymentEvent {
  const orderType = getOrderType(order.packageId);
  const pkgName = getOrderLabel(order.packageId);
  const customer = order.organization.memberships[0]?.user ?? null;
  const customerName = customer?.name || order.organization.name;
  const claimedAt = orderClaimedAt(order);
  const kind = eventKind(order, claimedAt);

  return {
    id: `${order.id}-${kind}`,
    kind,
    orderId: order.id,
    status: order.status,
    amountTry: order.amountTry,
    credits: order.credits,
    packageId: order.packageId,
    packageName: pkgName,
    orderType,
    orderTypeLabel: ORDER_TYPE_LABELS[orderType],
    provider: order.provider,
    createdAt: order.createdAt.toISOString(),
    completedAt: order.completedAt?.toISOString() ?? null,
    claimedAt,
    customer: customer
      ? { id: customer.id, name: customer.name, email: customer.email }
      : null,
    organization: {
      id: order.organization.id,
      name: order.organization.name,
      slug: order.organization.slug,
      credits: order.organization.credits,
      unlimitedCredits: order.organization.unlimitedCredits,
    },
    message: eventMessage(kind, customerName, pkgName, order.amountTry, orderType),
  };
}

export function isEventAfterSince(event: AdminPaymentEvent, since: Date): boolean {
  if (new Date(event.createdAt) > since) return true;
  if (event.completedAt && new Date(event.completedAt) > since) return true;
  if (event.claimedAt && new Date(event.claimedAt) > since) return true;
  return false;
}

const orderInclude = {
  organization: {
    select: {
      id: true,
      name: true,
      slug: true,
      credits: true,
      unlimitedCredits: true,
      memberships: {
        where: { role: "OWNER" as const },
        take: 1,
        select: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  },
};

function sortPendingOrders(orders: OrderWithOrg[]) {
  return [...orders].sort((a, b) => {
    const aClaimed = a.status === PaymentStatus.AWAITING_CONFIRMATION ? 1 : 0;
    const bClaimed = b.status === PaymentStatus.AWAITING_CONFIRMATION ? 1 : 0;
    if (aClaimed !== bClaimed) return bClaimed - aClaimed;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export async function fetchAdminPaymentEvents(limit = 60) {
  const orders = await prisma.paymentOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: orderInclude,
  });
  return orders.map(mapPaymentOrderToEvent);
}

export async function fetchPendingPaymentEvents() {
  const orders = await prisma.paymentOrder.findMany({
    where: {
      status: { in: [PaymentStatus.PENDING, PaymentStatus.AWAITING_CONFIRMATION] },
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: orderInclude,
  });
  return sortPendingOrders(orders).map(mapPaymentOrderToEvent);
}

export async function fetchRecentPaymentEventsSince(since: Date, limit = 12) {
  const orders = await prisma.paymentOrder.findMany({
    where: {
      OR: [{ createdAt: { gt: since } }, { completedAt: { gt: since } }],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: orderInclude,
  });
  return orders.map(mapPaymentOrderToEvent).filter((e) => isEventAfterSince(e, since));
}

export async function fetchAdminSalesStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [pending, claimed, completedToday, revenueAll, orgBalances, customerCount] = await Promise.all([
    prisma.paymentOrder.aggregate({
      where: { status: { in: [PaymentStatus.PENDING, PaymentStatus.AWAITING_CONFIRMATION] } },
      _count: true,
      _sum: { amountTry: true },
    }),
    prisma.paymentOrder.count({ where: { status: PaymentStatus.AWAITING_CONFIRMATION } }),
    prisma.paymentOrder.findMany({
      where: { status: PaymentStatus.COMPLETED, completedAt: { gte: startOfDay } },
      select: { amountTry: true, credits: true },
    }),
    prisma.paymentOrder.aggregate({
      where: { status: PaymentStatus.COMPLETED },
      _sum: { amountTry: true, credits: true },
      _count: true,
    }),
    prisma.organization.aggregate({
      _sum: { credits: true },
      _count: true,
    }),
    prisma.user.count({ where: { role: "CUSTOMER", isActive: true } }),
  ]);

  return {
    pendingCount: pending._count,
    pendingAmountTry: pending._sum.amountTry ?? 0,
    fastClaimedCount: claimed,
    todayRevenueTry: completedToday.reduce((s, o) => s + o.amountTry, 0),
    todayOrderCount: completedToday.length,
    todayCreditsSold: completedToday.reduce((s, o) => s + o.credits, 0),
    totalRevenueTry: revenueAll._sum.amountTry ?? 0,
    totalCompletedOrders: revenueAll._count,
    totalCreditsSold: revenueAll._sum.credits ?? 0,
    totalPlatformCredits: orgBalances._sum.credits ?? 0,
    organizationCount: orgBalances._count,
    activeCustomers: customerCount,
  };
}
