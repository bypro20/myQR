import { getCompanyInfo } from "@/lib/company-info";

const DEFAULT_PHONE_DIGITS = "905051236824";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/** E.164 benzeri rakam dizisi (90…) */
export function getPhoneDigits() {
  const phone = process.env.COMPANY_PHONE || process.env.COMPANY_WHATSAPP || "";
  const digits = digitsOnly(phone);
  if (digits.length >= 10) {
    return digits.startsWith("90") ? digits : `90${digits.replace(/^0/, "")}`;
  }
  return DEFAULT_PHONE_DIGITS;
}

export function getWhatsAppNumber() {
  return getPhoneDigits();
}

export function formatPhoneDisplay() {
  const n = getPhoneDigits();
  const local = n.startsWith("90") ? `0${n.slice(2)}` : n;
  if (local.length === 11) {
    return local.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
  }
  return local;
}

export function formatWhatsAppDisplay() {
  return formatPhoneDisplay();
}

export function getPhoneTelLink() {
  return `tel:+${getPhoneDigits()}`;
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

export const PARTNER_EMAIL = process.env.COMPANY_PARTNER_EMAIL || "ortaklik@myqar.net";
