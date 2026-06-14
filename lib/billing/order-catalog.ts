import { getCreditPackage } from "@/lib/billing/packages";
import { getPlan, type PlanDefinition, type PlanTier } from "@/lib/plans";

export type BillingOrderType = "credits" | "subscription";

const SUBSCRIPTION_PREFIX = "sub_";

const PLAN_RANK: Record<PlanTier, number> = {
  FREE: 0,
  STARTER: 1,
  PRO: 2,
  BUSINESS: 3,
};

export const SUBSCRIPTION_PLAN_IDS = ["STARTER", "PRO", "BUSINESS"] as const;
export type SubscriptionPlanId = (typeof SUBSCRIPTION_PLAN_IDS)[number];

export function subscriptionPackageId(planTier: SubscriptionPlanId) {
  return `${SUBSCRIPTION_PREFIX}${planTier}`;
}

export function isSubscriptionPackageId(packageId: string) {
  return packageId.startsWith(SUBSCRIPTION_PREFIX);
}

export function getSubscriptionPlanFromPackageId(packageId: string): SubscriptionPlanId | null {
  if (!isSubscriptionPackageId(packageId)) return null;
  const tier = packageId.slice(SUBSCRIPTION_PREFIX.length) as SubscriptionPlanId;
  return SUBSCRIPTION_PLAN_IDS.includes(tier) ? tier : null;
}

export function getOrderType(packageId: string): BillingOrderType {
  return isSubscriptionPackageId(packageId) ? "subscription" : "credits";
}

export function getOrderPlan(packageId: string): PlanDefinition | null {
  const tier = getSubscriptionPlanFromPackageId(packageId);
  return tier ? getPlan(tier) : null;
}

export function getOrderLabel(packageId: string) {
  const plan = getOrderPlan(packageId);
  if (plan) return `${plan.name} abonelik`;
  const pkg = getCreditPackage(packageId);
  return pkg?.name ?? packageId;
}

export function canSubscribeToPlan(
  org: { planTier: string; subscriptionStatus: string },
  targetTier: SubscriptionPlanId,
) {
  if (org.subscriptionStatus === "ACTIVE") {
    const current = org.planTier as PlanTier;
    if (current === targetTier) {
      return { ok: false as const, error: "Bu plan zaten aktif." };
    }
    if (PLAN_RANK[targetTier] <= PLAN_RANK[current]) {
      return { ok: false as const, error: "Mevcut planınızdan düşük bir paket seçilemez." };
    }
  }
  return { ok: true as const };
}
