import { PRICING } from "@/lib/billing/pricing-config";

/** Lansman dönemi teklifleri — tek kaynak */
export const LAUNCH = {
  active: true,
  /** ISO tarih — bu tarihe kadar ekstra kredi geçerli */
  endsAt: "2026-07-15T23:59:59+03:00",
  label: "Resmi Lansman",
  extraSignupCredits: 10,
  headline: "Lansmana özel +10 ekstra kredi",
  subline: "Kredi kartı gerekmez · anında erişim",
  ctaPrimary: "Lansmana özel başla",
  ctaSecondary: "Paketleri incele",
  bannerText: "Resmi lansman: 14 gün Pro denemesi + {credits} hoş geldin kredisi — sınırlı süre",
} as const;

export function isLaunchActive(at = new Date()) {
  if (!LAUNCH.active) return false;
  return at.getTime() <= new Date(LAUNCH.endsAt).getTime();
}

export function totalSignupCredits() {
  return PRICING.signupBonusCredits + (isLaunchActive() ? LAUNCH.extraSignupCredits : 0);
}

export function launchBannerText() {
  return LAUNCH.bannerText.replace("{credits}", String(totalSignupCredits()));
}

export function signupOfferLine() {
  const credits = totalSignupCredits();
  const base = `${PRICING.trialDays} gün Pro denemesi · ${credits} hoş geldin kredisi`;
  return isLaunchActive() ? `${base} · lansmana özel +${LAUNCH.extraSignupCredits} ekstra` : base;
}

export function launchDaysLeft(at = new Date()) {
  if (!isLaunchActive(at)) return 0;
  const end = new Date(LAUNCH.endsAt).getTime();
  return Math.max(0, Math.ceil((end - at.getTime()) / (1000 * 60 * 60 * 24)));
}
