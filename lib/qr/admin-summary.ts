import { QR_TYPE_LABELS } from "@/lib/qr/types";
import { parseJson } from "@/lib/utils";

export type QrAdminSummaryInput = {
  type: string;
  mode: string;
  targetUrl?: string | null;
  payload: string;
  description?: string | null;
  customerName?: string | null;
  projectName?: string | null;
  productType?: string | null;
};

function clip(value: string, max = 100) {
  const t = value.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function pickPayloadSummary(type: string, payload: Record<string, unknown>, targetUrl?: string | null) {
  switch (type) {
    case "URL":
    case "GOOGLE_MAPS":
    case "GOOGLE_REVIEW":
    case "PAYMENT_LINK":
    case "ECOMMERCE":
    case "MENU":
    case "CATALOG":
      return clip(String(payload.url || targetUrl || ""));
    case "TEXT":
      return clip(String(payload.text || ""));
    case "WIFI":
      return payload.ssid ? `Wi‑Fi: ${payload.ssid}` : "";
    case "WHATSAPP":
      return payload.phone
        ? `WhatsApp: +${String(payload.countryCode || "").replace(/\D/g, "")}${String(payload.phone).replace(/\D/g, "")}`
        : "";
    case "TELEGRAM":
      return payload.username ? `@${String(payload.username).replace(/^@/, "")}` : clip(String(payload.url || ""));
    case "EMAIL":
      return payload.email ? `E-posta: ${payload.email}` : "";
    case "PHONE":
    case "SMS":
      return payload.phone ? `Tel: ${payload.phone}` : "";
    case "IBAN":
      return payload.iban ? `IBAN: ${String(payload.iban).replace(/\s/g, "")}` : "";
    case "VCARD":
    case "ME_CARD":
      return [payload.firstName, payload.lastName].filter(Boolean).join(" ") || String(payload.company || "");
    case "LINK_BIO":
      return payload.slug ? `Bio: /bio/${payload.slug}` : "Link in bio";
    case "WARRANTY":
      return payload.slug ? `Garanti: /garanti/${payload.slug}` : "Garanti kaydı";
    case "LCV":
      return payload.eventName
        ? `Davet: ${payload.eventName}`
        : payload.slug
          ? `LCV: /lcv/${payload.slug}`
          : "LCV formu";
    case "GEO":
      return payload.address ? clip(String(payload.address)) : "Konum QR";
    case "PDF":
      return payload.fileName ? `PDF: ${payload.fileName}` : "PDF dosyası";
    case "COUPON":
      return payload.code ? `Kupon: ${payload.code}` : "Kupon QR";
    case "EVENT":
      return payload.title ? `Etkinlik: ${payload.title}` : "Etkinlik QR";
    default: {
      if (targetUrl) return clip(targetUrl);
      if (payload.url) return clip(String(payload.url));
      if (payload.text) return clip(String(payload.text));
      if (payload.username) return `@${String(payload.username).replace(/^@/, "")}`;
      return "";
    }
  }
}

/** Admin panelinde gösterilecek işlem özeti */
export function summarizeQrForAdmin(qr: QrAdminSummaryInput) {
  const payload = parseJson<Record<string, unknown>>(qr.payload, {});
  const typeLabel = QR_TYPE_LABELS[qr.type] || qr.type;
  const modeLabel = qr.mode === "DYNAMIC" ? "Dinamik QR oluşturdu" : "Statik QR oluşturdu";
  const action = `${typeLabel} · ${modeLabel}`;

  const parts: string[] = [];
  const payloadLine = pickPayloadSummary(qr.type, payload, qr.targetUrl);
  if (payloadLine) parts.push(payloadLine);
  if (qr.projectName) parts.push(`Proje: ${qr.projectName}`);
  if (qr.customerName) parts.push(`Müşteri: ${qr.customerName}`);
  if (qr.productType) parts.push(`Ürün: ${qr.productType}`);
  if (qr.description) parts.push(clip(qr.description, 80));

  const detail = parts.join(" · ") || "—";

  return { action, detail, typeLabel };
}
