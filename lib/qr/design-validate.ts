import { DEFAULT_DESIGN, type QrDesign } from "@/lib/qr/types";
import { parseJson } from "@/lib/utils";

export type ValidationWarning = {
  level: "error" | "warning";
  message: string;
};

function contrastRatio(fg: string, bg: string) {
  const parse = (hex: string) => {
    const c = hex.replace("#", "");
    const full = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
    const num = parseInt(full, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };
  const lum = (hex: string) => {
    const { r, g, b } = parse(hex);
    const srgb = [r, g, b].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  };
  const l1 = lum(fg);
  const l2 = lum(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function parseDesign(raw: string | QrDesign | Record<string, unknown>): QrDesign {
  if (typeof raw === "string") {
    return { ...DEFAULT_DESIGN, ...parseJson(raw, {}) };
  }
  return { ...DEFAULT_DESIGN, ...(raw as QrDesign) };
}

export function validateQrDesign(designRaw: string | QrDesign, contentLength: number) {
  const design = parseDesign(designRaw);
  const warnings: ValidationWarning[] = [];

  if (design.size < 256) {
    warnings.push({ level: "warning", message: "QR kod çok küçük olabilir." });
  }
  if (contrastRatio(design.foregroundColor, design.backgroundColor) < 3) {
    warnings.push({
      level: "warning",
      message: "Arka plan ve QR rengi arasında kontrast düşük — banka uygulamaları okuyamayabilir.",
    });
  }
  if (design.logoUrl && design.logoSize > 0.28) {
    warnings.push({ level: "warning", message: "Logo boyutu QR okunabilirliğini bozabilir." });
  }
  if (design.margin < 2) {
    warnings.push({ level: "warning", message: "Kenar boşluğu yeterli olmayabilir." });
  }
  if (contentLength > 800) {
    warnings.push({ level: "warning", message: "QR içeriği çok uzun; okunabilirlik düşebilir." });
  }
  return warnings;
}
