import {
  buildCatalogDirectContent,
  isStaticOnlyType,
  validateCatalogInput,
} from "@/lib/qr/catalog";
import { buildQrContent } from "@/lib/qr/generators";
import { normalizeQrData } from "@/lib/qr/normalize";
import type { BioLink } from "@/lib/qr/types";
import { parseJson } from "@/lib/utils";

export type QrValidateInput = {
  name?: string | null;
  type: string;
  mode: "STATIC" | "DYNAMIC";
  payload?: Record<string, unknown>;
  targetUrl?: string | null;
  shortCode?: string | null;
  baseUrl?: string;
};

export class QrValidationError extends Error {
  errors: string[];

  constructor(errors: string[]) {
    super(errors.join(" "));
    this.name = "QrValidationError";
    this.errors = errors;
  }
}

export function validateQrInput(input: QrValidateInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const payload = input.payload || {};
  const type = input.type;
  const mode = input.mode;

  if (!input.name?.trim()) {
    errors.push("QR adı girilmediği için üretilemiyor.");
  }

  if (type === "LINK_BIO") {
    const links = (payload.links as BioLink[] | undefined) || [];
    const validLinks = links.filter((l) => {
      try {
        return l.label?.trim() && l.url?.trim() && new URL(l.url.trim()).protocol.startsWith("http");
      } catch {
        return false;
      }
    });
    if (validLinks.length === 0) {
      errors.push("En az bir geçerli bio linki (buton adı + https:// URL) girilmediği için QR üretilemiyor.");
    }
  } else {
    errors.push(...validateCatalogInput(type, payload, input.targetUrl?.trim()));
  }

  if (errors.length > 0) return { valid: false, errors };

  const effectiveMode = isStaticOnlyType(type) ? "STATIC" : mode;

  const normalized = normalizeQrData(type, payload, input.targetUrl, input.baseUrl);
  const previewCode = input.shortCode || (effectiveMode === "DYNAMIC" ? "onizleme" : null);

  if (effectiveMode === "DYNAMIC") {
    if (!previewCode && !input.shortCode) {
      errors.push("Dinamik QR için kısa kod oluşturulamadı.");
    }
    if (!normalized.targetUrl?.trim()) {
      errors.push("Tarama hedefi tanımlanamadığı için QR üretilemiyor. Zorunlu alanları kontrol edin.");
    }
  } else {
    const content = buildQrContent({
      type,
      mode: "STATIC",
      shortCode: input.shortCode,
      targetUrl: normalized.targetUrl,
      payload: normalized.payload,
      baseUrl: input.baseUrl,
    });
    if (!content?.trim()) {
      errors.push("QR içeriği oluşturulamadı. Zorunlu alanları doldurun.");
    }
  }

  return { valid: errors.length === 0, errors };
}

export function assertQrInputValid(input: QrValidateInput) {
  const result = validateQrInput(input);
  if (!result.valid) throw new QrValidationError(result.errors);
}

export function validateStoredQr(
  qr: {
    name: string;
    type: string;
    mode: string;
    shortCode: string | null;
    targetUrl: string | null;
    payload: string;
  },
  baseUrl?: string,
) {
  return validateQrInput({
    name: qr.name,
    type: qr.type,
    mode: qr.mode as "STATIC" | "DYNAMIC",
    shortCode: qr.shortCode,
    targetUrl: qr.targetUrl,
    payload: parseJson(qr.payload, {}),
    baseUrl,
  });
}

export function qrValidationResponse(errors: string[]) {
  return {
    error: errors.length === 1 ? errors[0] : "QR üretilemedi. Lütfen aşağıdaki hataları düzeltin.",
    errors,
  };
}
