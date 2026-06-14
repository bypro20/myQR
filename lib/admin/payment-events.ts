import { PaymentOrder, PaymentStatus } from "@/app/generated/prisma/client";
import { getCreditPackage } from "@/lib/billing/packages";
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

function eventMessage(kind: AdminPaymentEvent["kind"], customerName: string, pkgName: string, amountTry: number) {
  if (kind === "completed") {
    return `${customerName} · ${pkgName} satın aldı (₺${amountTry.toLocaleString("tr-TR")})`;
  }
  if (kind === "claimed") {
    return `${customerName} · ${pkgName} için ödeme bildirdi (₺${amountTry.toLocaleString("tr-TR")})`;
  }
  return `${customerName} · ${pkgName} siparişi başlattı (₺${amountTry.toLocaleString("tr-TR")})`;
}

export function mapPaymentOrderToEvent(order: OrderWithOrg): AdminPaymentEvent {
  const pkg = getCreditPackage(order.packageId);
  const pkgName = pkg?.name ?? order.packageId;
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
    message: eventMessage(kind, customerName, pkgName, order.amountTry),
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
    include: orderInclude,
  });
  return orders.map(mapPaymentOrderToEvent);
}

export async function fetchAdminSalesStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [pending, completedToday, revenueAll, orgBalances, customerCount] = await Promise.all([
    prisma.paymentOrder.aggregate({
      where: { status: { in: [PaymentStatus.PENDING, PaymentStatus.AWAITING_CONFIRMATION] } },
      _count: true,
      _sum: { amountTry: true },
    }),
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
