import { buildRedirectTarget } from "@/lib/qr/generators";
import { URL_QR_TYPES, buildCatalogDirectContent } from "@/lib/qr/catalog";
import { syncIbanPayload } from "@/lib/qr/turkish-banks";
import type { WhatsappPayload } from "@/lib/qr/types";
import { getAppUrl } from "@/lib/utils";

const SOCIAL_USERNAME_TYPES = new Set([
  "INSTAGRAM", "FACEBOOK", "YOUTUBE", "TIKTOK", "LINKEDIN", "TWITTER", "SNAPCHAT",
]);

export function normalizeQrData(
  type: string,
  payload: Record<string, unknown>,
  targetUrl?: string | null,
  baseUrl?: string,
) {
  const p = { ...payload };
  let target = targetUrl?.trim() || "";

  if (URL_QR_TYPES.has(type)) {
    const built = buildCatalogDirectContent({ type, payload: p, targetUrl: target, baseUrl });
    if (built && built.startsWith("http")) {
      p.url = built;
      target = built;
    } else {
      const url = String(p.url || target || "").trim();
      if (url) {
        p.url = url;
        target = url;
      }
    }
  }

  if (type === "WHATSAPP") {
    const wp = p as WhatsappPayload;
    const phone = `${wp.countryCode || ""}${wp.phone || ""}`.replace(/\D/g, "");
    if (phone) {
      const text = encodeURIComponent(String(wp.message || ""));
      target = text ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/${phone}`;
    }
  }

  if (type === "TELEGRAM") {
    const built = buildCatalogDirectContent({ type, payload: p, baseUrl });
    if (built) target = built;
  }

  if (SOCIAL_USERNAME_TYPES.has(type) && !target) {
    const built = buildCatalogDirectContent({ type, payload: p, baseUrl });
    if (built) {
      p.url = built;
      target = built;
    }
  }

  if (type === "PHONE" && p.phone) {
    target = `tel:${String(p.phone).replace(/\s/g, "")}`;
  }

  if (type === "SMS" && p.phone) {
    const phone = String(p.phone).replace(/\s/g, "");
    const message = String(p.message || "");
    target = message ? `sms:${phone}?body=${encodeURIComponent(message)}` : `sms:${phone}`;
  }

  if (type === "EMAIL" && p.email) {
    const params = new URLSearchParams();
    if (p.subject) params.set("subject", String(p.subject));
    if (p.body) params.set("body", String(p.body));
    const qs = params.toString();
    target = qs ? `mailto:${p.email}?${qs}` : `mailto:${String(p.email)}`;
  }

  if (type === "GEO" && p.latitude && p.longitude) {
    target = buildCatalogDirectContent({ type, payload: p, baseUrl });
  }

  if (type === "IBAN") {
    if (p.iban) Object.assign(p, syncIbanPayload(p));
    if (p.iban && p.receiverName) {
      target = buildCatalogDirectContent({ type, payload: p, baseUrl });
    }
  }

  if (!target && baseUrl) {
    const built = buildRedirectTarget({
      type,
      payload: p,
      shortCode: (p.slug as string | null) || null,
      baseUrl,
    });
    if (built) target = built;
  }

  return { payload: p, targetUrl: target || undefined };
}

export function resolveStoredTarget(
  type: string,
  mode: "STATIC" | "DYNAMIC",
  payload: Record<string, unknown>,
  targetUrl?: string | null,
  shortCode?: string | null,
) {
  const baseUrl = getAppUrl();
  const normalized = normalizeQrData(type, payload, targetUrl, baseUrl);

  if (mode === "DYNAMIC") {
    const redirect =
      normalized.targetUrl ||
      buildRedirectTarget({
        type,
        shortCode,
        targetUrl: normalized.targetUrl,
        payload: normalized.payload,
        baseUrl,
      });
    return { ...normalized, targetUrl: redirect || normalized.targetUrl };
  }

  return normalized;
}
