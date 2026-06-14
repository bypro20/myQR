import type { QrDurationTier } from "@/app/generated/prisma/client";
import type { PlanTier } from "@/lib/plans";
import { CREDIT_COSTS } from "@/lib/plans";
import { PRICING, getEffectivePlanTier } from "@/lib/billing/pricing-config";

export type DurationTierDef = {
  id: QrDurationTier;
  label: string;
  shortLabel: string;
  days: number | null;
  /** Ek kredi (ücretsiz planda tam fiyat; abonelikte indirimli/0) */
  extraCredits: number;
  description: string;
  badge?: string;
  recommended?: boolean;
  /** Abonelik planına dahil mi */
  subscriptionIncluded?: PlanTier[];
};

/**
 * QR yaşam döngüsü paketleri — QR Code Generator / Bitly modeli:
 * Ücretsiz deneme → süre bitince tarama durur → kredi veya abonelik ile uzatma/kalıcı.
 */
export const QR_DURATION_TIERS: DurationTierDef[] = [
  {
    id: "FREE_TRIAL",
    label: "15 Gün Ücretsiz Deneme",
    shortLabel: "15 gün",
    days: PRICING.freeQrTrialDays,
    extraCredits: 0,
    description: "Dinamik QR deneyin — süre bitince tarama durur, paket almanız gerekir",
    badge: "Ücretsiz",
  },
  {
    id: "WEEKLY",
    label: "Haftalık",
    shortLabel: "7 gün",
    days: 7,
    extraCredits: 10,
    description: "Kampanya, etkinlik, pop-up menü",
  },
  {
    id: "MONTHLY",
    label: "Aylık",
    shortLabel: "30 gün",
    days: 30,
    extraCredits: 25,
    description: "Restoran menüsü, kartvizit, mağaza vitrin",
    recommended: true,
    subscriptionIncluded: ["STARTER", "PRO", "BUSINESS"],
  },
  {
    id: "YEARLY",
    label: "Yıllık",
    shortLabel: "365 gün",
    days: 365,
    extraCredits: 75,
    description: "Matbaa baskısı, uzun vadeli tabela ve etiket",
    subscriptionIncluded: ["BUSINESS"],
  },
  {
    id: "PERMANENT",
    label: "Kalıcı (Süresiz)",
    shortLabel: "Süresiz",
    days: null,
    extraCredits: 150,
    description: "Bir kez ödeyin — QR sonsuza kadar aktif (matbaa için ideal)",
    badge: "En çok tercih",
  },
];

const PLAN_DISCOUNT: Partial<Record<PlanTier, Partial<Record<QrDurationTier, number>>>> = {
  STARTER: { YEARLY: 0.85, PERMANENT: 0.85 },
  PRO: { WEEKLY: 0.9, YEARLY: 0.7, PERMANENT: 0.65 },
  BUSINESS: { WEEKLY: 0.75, YEARLY: 0.5, PERMANENT: 0.45 },
};

export function getDurationTier(id: string): DurationTierDef | undefined {
  return QR_DURATION_TIERS.find((t) => t.id === id);
}

export function qrBaseCost(mode: "STATIC" | "DYNAMIC") {
  return mode === "DYNAMIC" ? CREDIT_COSTS.DYNAMIC_QR : CREDIT_COSTS.STATIC_QR;
}

type OrgPricing = {
  planTier: string;
  subscriptionStatus: string;
  trialEndsAt: Date | string | null;
  unlimitedCredits?: boolean;
};

export function tierExtraCredits(
  durationTier: QrDurationTier,
  org: OrgPricing,
): number {
  const tier = getDurationTier(durationTier);
  if (!tier) return 0;
  if (tier.id === "FREE_TRIAL") return 0;

  const effectivePlan = getEffectivePlanTier(org);
  const isPaidSub =
    org.subscriptionStatus === "ACTIVE" &&
    effectivePlan !== "FREE";

  if (isPaidSub && tier.subscriptionIncluded?.includes(effectivePlan)) {
    return 0;
  }

  let extra = tier.extraCredits;
  const discount = PLAN_DISCOUNT[effectivePlan]?.[durationTier];
  if (discount) extra = Math.ceil(extra * discount);

  return extra;
}

/** Yeni QR oluşturma toplam maliyeti */
export function qrTotalCreationCost(
  mode: "STATIC" | "DYNAMIC",
  durationTier: QrDurationTier,
  org: OrgPricing,
) {
  return qrBaseCost(mode) + tierExtraCredits(durationTier, org);
}

/** Süre uzatma — taban ücret yok, yalnızca süre paketi */
export function qrRenewalCost(
  mode: "STATIC" | "DYNAMIC",
  durationTier: QrDurationTier,
  org: OrgPricing,
) {
  void mode;
  return tierExtraCredits(durationTier, org);
}

export function computeExpiresAt(durationTier: QrDurationTier, from = new Date()): Date | null {
  const tier = getDurationTier(durationTier);
  if (!tier || tier.days === null) return null;
  const d = new Date(from);
  d.setDate(d.getDate() + tier.days);
  return d;
}

export function extendExpiresAt(
  durationTier: QrDurationTier,
  currentExpiresAt: Date | null | undefined,
): Date | null {
  const tier = getDurationTier(durationTier);
  if (!tier || tier.days === null) return null;
  const base = currentExpiresAt && currentExpiresAt.getTime() > Date.now() ? currentExpiresAt : new Date();
  return computeExpiresAt(durationTier, base);
}

export function isQrExpired(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false;
  return expiresAt.getTime() <= Date.now();
}

export function daysUntilExpiry(expiresAt: Date | null | undefined): number | null {
  if (!expiresAt) return null;
  return Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function availableDurationTiers(
  org: OrgPricing & { credits: number },
  mode: "STATIC" | "DYNAMIC",
): DurationTierDef[] {
  if (org.unlimitedCredits) return QR_DURATION_TIERS;

  const effectivePlan = getEffectivePlanTier(org);
  const isPaidSub = org.subscriptionStatus === "ACTIVE" && effectivePlan !== "FREE";

  return QR_DURATION_TIERS.filter((tier) => {
    if (tier.id === "FREE_TRIAL") return true;

    if (isPaidSub && tier.subscriptionIncluded?.includes(effectivePlan)) return true;

    const cost = qrTotalCreationCost(mode, tier.id, org);
    return org.credits >= cost;
  });
}

export function defaultDurationTier(org: OrgPricing): QrDurationTier {
  const effective = getEffectivePlanTier(org);
  if (effective === "FREE") return "FREE_TRIAL";
  if (org.subscriptionStatus === "ACTIVE") return "MONTHLY";
  return "MONTHLY";
}

export function durationTierLabel(id: string) {
  return getDurationTier(id)?.label ?? id;
}

export function expiryStatus(expiresAt: Date | null | undefined, durationTier: string) {
  if (durationTier === "PERMANENT" || !expiresAt) {
    return { state: "permanent" as const, label: "Kalıcı", variant: "success" as const };
  }
  const days = daysUntilExpiry(expiresAt);
  if (days === null) return { state: "permanent" as const, label: "Kalıcı", variant: "success" as const };
  if (days <= 0) return { state: "expired" as const, label: "Süresi doldu", variant: "danger" as const };
  if (days <= 3) return { state: "critical" as const, label: `${days} gün kaldı`, variant: "warning" as const };
  if (days <= 7) return { state: "warning" as const, label: `${days} gün kaldı`, variant: "warning" as const };
  return { state: "active" as const, label: `${days} gün`, variant: "muted" as const };
}

/** Pazarlama / billing UI için özet tablo */
export function qrLifecyclePricingTable(mode: "STATIC" | "DYNAMIC" = "DYNAMIC") {
  const base = qrBaseCost(mode);
  return QR_DURATION_TIERS.map((t) => ({
    ...t,
    totalCredits: base + t.extraCredits,
    renewCredits: t.extraCredits,
  }));
}
