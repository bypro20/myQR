import { getCompanyInfo } from "@/lib/company-info";

const DEFAULT_WHATSAPP = "905051236824";

export function getWhatsAppNumber() {
  const phone = process.env.COMPANY_WHATSAPP || process.env.COMPANY_PHONE || "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    return digits.startsWith("90") ? digits : `90${digits.replace(/^0/, "")}`;
  }
  return DEFAULT_WHATSAPP;
}

export function formatWhatsAppDisplay() {
  const n = getWhatsAppNumber();
  if (n === "905051236824") return "0505 123 68 24";
  const local = n.startsWith("90") ? `0${n.slice(2)}` : n;
  return local.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4").trim();
}

export function buildWhatsAppUrl(message?: string) {
  const base = `https://wa.me/${getWhatsAppNumber()}`;
  if (!message?.trim()) return base;
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}

export function getPartnerWhatsAppMessage(preset: "general" | "pricing" | "apply" = "general") {
  const c = getCompanyInfo();
  const lines: Record<typeof preset, string> = {
    general: `Merhaba, ${c.tradeName} panel kiralama / iş ortağı programı hakkında bilgi almak istiyorum.`,
    pricing: `Merhaba, panel kiralama için indirimli toptan kredi teklifi almak istiyorum.`,
    apply: `Merhaba, iş ortağı olarak panel kiralama başvurusu yapmak istiyorum.`,
  };
  return lines[preset];
}

export const PARTNER_EMAIL = process.env.COMPANY_PARTNER_EMAIL || "ortaklik@myqr.com";
