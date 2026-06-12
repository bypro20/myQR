import { getAppUrl } from "@/lib/utils";
import type {
  EmailPayload,
  MapsPayload,
  PdfPayload,
  PhonePayload,
  ReviewPayload,
  SmsPayload,
  SocialPayload,
  UrlPayload,
  VcardPayload,
  WhatsappPayload,
  WifiPayload,
} from "@/lib/qr/types";

type BuildInput = {
  type: string;
  mode: "STATIC" | "DYNAMIC";
  shortCode?: string | null;
  targetUrl?: string | null;
  payload: Record<string, unknown>;
};

function escapeVcard(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export function buildQrContent(input: BuildInput) {
  const { type, mode, shortCode, targetUrl, payload } = input;

  if (mode === "DYNAMIC" && shortCode) {
    return `${getAppUrl()}/q/${shortCode}`;
  }

  switch (type) {
    case "URL":
      return String((payload as UrlPayload).url || targetUrl || "");
    case "GOOGLE_MAPS":
    case "GOOGLE_REVIEW":
      return String((payload as MapsPayload | ReviewPayload).url || targetUrl || "");
    case "WIFI": {
      const p = payload as WifiPayload;
      const hidden = p.hidden ? "H:true;" : "";
      const enc = p.encryption === "nopass" ? "nopass" : p.encryption;
      return `WIFI:T:${enc};S:${p.ssid};P:${p.password || ""};${hidden};`;
    }
    case "WHATSAPP": {
      const p = payload as WhatsappPayload;
      const phone = `${p.countryCode || ""}${p.phone || ""}`.replace(/\D/g, "");
      const text = encodeURIComponent(p.message || "");
      return text ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/${phone}`;
    }
    case "SOCIAL":
      return String((payload as SocialPayload).url || targetUrl || "");
    case "LINK_BIO":
      return `${getAppUrl()}/bio/${payload.slug || shortCode}`;
    case "VCARD": {
      const p = payload as VcardPayload;
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${escapeVcard(p.fullName)}`,
        p.company ? `ORG:${escapeVcard(p.company)}` : "",
        p.title ? `TITLE:${escapeVcard(p.title)}` : "",
        p.phone ? `TEL;TYPE=CELL:${p.phone}` : "",
        p.email ? `EMAIL:${p.email}` : "",
        p.website ? `URL:${p.website}` : "",
        p.address ? `ADR:;;${escapeVcard(p.address)};;;;` : "",
        p.note ? `NOTE:${escapeVcard(p.note)}` : "",
        "END:VCARD",
      ].filter(Boolean);
      return lines.join("\n");
    }
    case "EMAIL": {
      const p = payload as EmailPayload;
      const params = new URLSearchParams();
      if (p.subject) params.set("subject", p.subject);
      if (p.body) params.set("body", p.body);
      const qs = params.toString();
      return qs ? `mailto:${p.email}?${qs}` : `mailto:${p.email}`;
    }
    case "PHONE":
      return `tel:${(payload as PhonePayload).phone}`;
    case "SMS": {
      const p = payload as SmsPayload;
      return p.message ? `sms:${p.phone}?body=${encodeURIComponent(p.message)}` : `sms:${p.phone}`;
    }
    case "PDF":
      return String((payload as PdfPayload).url || targetUrl || "");
    case "WARRANTY":
      return `${getAppUrl()}/garanti/${payload.slug || shortCode}`;
    case "LCV":
      return `${getAppUrl()}/lcv/${payload.slug || shortCode}`;
    default:
      return String(targetUrl || "");
  }
}
