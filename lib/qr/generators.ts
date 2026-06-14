import { buildCatalogDirectContent } from "@/lib/qr/catalog";
import { getAppUrl } from "@/lib/utils";

export type QrBuildInput = {
  type: string;
  mode: "STATIC" | "DYNAMIC";
  shortCode?: string | null;
  targetUrl?: string | null;
  payload: Record<string, unknown>;
  baseUrl?: string;
};

export function appBase(baseUrl?: string) {
  return (baseUrl || getAppUrl()).replace(/\/$/, "");
}

/** Direct QR payload — static mode content or dynamic redirect target. */
export function buildDirectContent(input: Omit<QrBuildInput, "mode">) {
  return buildCatalogDirectContent(input);
}

/** Final string encoded into the QR image. */
export function buildQrContent(input: QrBuildInput) {
  const { mode, shortCode, baseUrl } = input;

  if (mode === "DYNAMIC" && shortCode) {
    return `${appBase(baseUrl)}/q/${shortCode}`;
  }

  return buildDirectContent(input);
}

/** Where /q/[code] sends the visitor after scan. */
export function buildRedirectTarget(input: Omit<QrBuildInput, "mode">) {
  if (input.targetUrl?.trim()) return input.targetUrl.trim();
  return buildDirectContent(input) || null;
}
