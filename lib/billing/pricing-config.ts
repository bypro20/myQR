import type { PlanTier } from "@/lib/plans";

/** Tek kaynak — fiyatlandırma ve ücretsiz limitler */
export const PRICING = {
  /** Yeni kayıt hediye kredisi (≈ 5 statik QR veya deneme için yeterli) */
  signupBonusCredits: 15,
  /** Pro özellikleri açık deneme süresi */
  trialDays: 14,
  /** Deneme süresince efektif plan (dinamik QR, analitik vb.) */
  trialEffectivePlan: "PRO" as PlanTier,

  /** Ücretsiz planda QR deneme süresi (gün) */
  freeQrTrialDays: 15,

  /** Ücretsiz planda kalınca */
  free: {
    qrLimit: 3,
    dynamicQr: false,
    bulkExport: false,
    warrantyLcv: false,
  },

  /**
   * QR gelir modeli (SaaS standardı):
   * 1. Ücretsiz: 15 gün dinamik deneme, sonra tarama engeli
   * 2. Kredi paketi: süre uzatma / kalıcı QR
   * 3. Abonelik (Starter+): aylık QR dahil, indirimli yıllık/kalıcı
   */
  qrMonetization: {
    freeTrialDays: 15,
    blockScanWhenExpired: true,
    renewalChargesBaseCost: false,
  },

  /** Kredi tüketimi — değiştirmeyin, paket değerini belirler */
  creditCosts: {
    staticQr: 1,
    dynamicQr: 3,
    bulkRow: 1,
    pdfExport: 2,
  },
} as const;

export function isTrialActive(org: {
  subscriptionStatus: string;
  trialEndsAt: Date | string | null;
}) {
  if (org.subscriptionStatus !== "TRIAL") return false;
  if (!org.trialEndsAt) return false;
  return new Date(org.trialEndsAt).getTime() > Date.now();
}

/** Deneme aktifse Pro özellikleri; süresi dolunca kayıtlı plan geçerli */
export function getEffectivePlanTier(org: {
  planTier: string;
  subscriptionStatus: string;
  trialEndsAt: Date | string | null;
}): PlanTier {
  if (isTrialActive(org)) return PRICING.trialEffectivePlan;
  return (org.planTier as PlanTier) || "FREE";
}
