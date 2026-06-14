export type CompanyInfo = {
  tradeName: string;
  legalName: string;
  businessType: "sole" | "company";
  taxId: string;
  mersisNo: string;
  address: string;
  city: string;
  country: string;
  kep: string;
  email: string;
  phone: string;
  website: string;
  chamber: string;
  chamberRulesUrl: string;
  serviceDescription: string;
};

function env(key: string, fallback: string) {
  const v = process.env[key]?.trim();
  return v || fallback;
}

export function getCompanyInfo(): CompanyInfo {
  const website =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://myqar.net";

  return {
    tradeName: env("COMPANY_TRADE_NAME", "myQR"),
    legalName: env("COMPANY_LEGAL_NAME", env("PAYMENT_ACCOUNT_NAME", "Uğur Öncan")),
    businessType: env("COMPANY_TYPE", "sole") === "company" ? "company" : "sole",
    taxId: env("COMPANY_TAX_ID", ""),
    mersisNo: env("COMPANY_MERSIS", ""),
    address: env("COMPANY_ADDRESS", ""),
    city: env("COMPANY_CITY", "İstanbul"),
    country: env("COMPANY_COUNTRY", "Türkiye"),
    kep: env("COMPANY_KEP", ""),
    email: env("COMPANY_EMAIL", "destek@myqr.com"),
    phone: env("COMPANY_PHONE", ""),
    website,
    chamber: env("COMPANY_CHAMBER", ""),
    chamberRulesUrl: env("COMPANY_CHAMBER_RULES_URL", ""),
    serviceDescription:
      "Dijital QR kod üretim, yönetim ve analiz yazılımı (SaaS). Abonelik planları ve kredi paketleri ile sunulur.",
  };
}

export function formatCompanyAddress(info: CompanyInfo) {
  const parts = [info.address, info.city, info.country].filter(Boolean);
  return parts.join(", ") || "—";
}
