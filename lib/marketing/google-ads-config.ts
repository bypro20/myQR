/** Google Ads / GA4 — env ile yapılandırılır. Değerleri Google Ads → Hedefler → Dönüşümler'den alın. */

export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_ID?.trim() || "";

/** Örn. AW-1234567890 */
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "";

/** Kayıt dönüşümü — örn. AW-1234567890/AbCdEfGh */
export const GOOGLE_ADS_SIGNUP_SEND_TO =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_SEND_TO?.trim() || "";

/** Ödeme dönüşümü — örn. AW-1234567890/XyZ12345 */
export const GOOGLE_ADS_PURCHASE_SEND_TO =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO?.trim() || "";

export function isGoogleTagsEnabled() {
  return Boolean(GA4_MEASUREMENT_ID || GOOGLE_ADS_ID);
}

export function primaryGtagId() {
  return GA4_MEASUREMENT_ID || GOOGLE_ADS_ID;
}
