import { getAppUrl } from "@/lib/utils";
import { getCompanyInfo } from "@/lib/company-info";

export const SITE_NAME = "myQR";
export const SITE_LOCALE = "tr_TR";
export const SITE_LANGUAGE = "tr";

/** Ana hedef anahtar kelimeler — Türkiye QR SaaS */
export const DEFAULT_KEYWORDS = [
  "qr kod oluştur",
  "dinamik qr kod",
  "qr kod generator",
  "toplu qr kod",
  "qr kod platformu",
  "matbaa qr kod",
  "restoran menü qr",
  "qr kod analitik",
  "qr kod fiyatları",
  "qr kod yazılımı",
  "myqr",
  "myqar",
] as const;

/** Google Search Console doğrulama (HTML etiket content değeri) */
export const GOOGLE_SITE_VERIFICATION =
  process.env.GOOGLE_SITE_VERIFICATION?.trim() || "WgO7_amXLy5Lv6DGei_x5PL3EEsAQxrXbkDeDVd3OR8";

export function getSiteUrl() {
  return getAppUrl().replace(/\/$/, "");
}

export function getSiteConfig() {
  const company = getCompanyInfo();
  return {
    name: SITE_NAME,
    url: getSiteUrl(),
    description:
      "Matbaa, ajans ve perakende için profesyonel QR kod platformu. Dinamik QR, toplu üretim, garanti formları ve canlı analitik.",
    email: company.email,
    phone: company.phone,
    legalName: company.legalName,
    tradeName: company.tradeName,
    locale: SITE_LOCALE,
  };
}

export function absoluteUrl(path: string) {
  const base = getSiteUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
