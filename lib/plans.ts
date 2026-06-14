export type PlanTier = "FREE" | "STARTER" | "PRO" | "BUSINESS";

export type PlanDefinition = {
  id: PlanTier;
  name: string;
  priceTry: number;
  period: "ay" | "yıl";
  creditsMonthly: number;
  qrLimit: number | null;
  dynamicQr: boolean;
  bulkExport: boolean;
  analytics: boolean;
  warrantyLcv: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  support: string;
  highlight?: boolean;
};

export const PLANS: PlanDefinition[] = [
  {
    id: "FREE",
    name: "Ücretsiz",
    priceTry: 0,
    period: "ay",
    creditsMonthly: 0,
    qrLimit: 3,
    dynamicQr: false,
    bulkExport: false,
    analytics: false,
    warrantyLcv: false,
    apiAccess: false,
    whiteLabel: false,
    support: "Topluluk / e-posta",
  },
  {
    id: "STARTER",
    name: "Starter",
    priceTry: 299,
    period: "ay",
    creditsMonthly: 150,
    qrLimit: 30,
    dynamicQr: true,
    bulkExport: false,
    analytics: true,
    warrantyLcv: false,
    apiAccess: false,
    whiteLabel: false,
    support: "E-posta · 48 saat",
  },
  {
    id: "PRO",
    name: "Pro",
    priceTry: 699,
    period: "ay",
    creditsMonthly: 600,
    qrLimit: 150,
    dynamicQr: true,
    bulkExport: true,
    analytics: true,
    warrantyLcv: true,
    apiAccess: false,
    whiteLabel: false,
    support: "Öncelikli · 24 saat",
    highlight: true,
  },
  {
    id: "BUSINESS",
    name: "Business",
    priceTry: 1799,
    period: "ay",
    creditsMonthly: 2500,
    qrLimit: null,
    dynamicQr: true,
    bulkExport: true,
    analytics: true,
    warrantyLcv: true,
    apiAccess: true,
    whiteLabel: true,
    support: "Özel hesap yöneticisi",
  },
];

export const CREDIT_COSTS = {
  STATIC_QR: 1,
  DYNAMIC_QR: 3,
  BULK_ROW: 1,
  PDF_EXPORT: 2,
  TEMPLATE_CUSTOM: 5,
} as const;

export function getPlan(tier: PlanTier) {
  return PLANS.find((p) => p.id === tier) ?? PLANS[0];
}

export function planAllows(tier: PlanTier, feature: keyof Omit<PlanDefinition, "id" | "name" | "priceTry" | "period" | "creditsMonthly" | "qrLimit" | "support" | "highlight">) {
  const plan = getPlan(tier);
  return Boolean(plan[feature]);
}
