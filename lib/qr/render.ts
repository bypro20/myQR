import QRCode from "qrcode";
import { DEFAULT_DESIGN, type QrDesign } from "@/lib/qr/types";
import { parseJson } from "@/lib/utils";

function contrastRatio(fg: string, bg: string) {
  const parse = (hex: string) => {
    const c = hex.replace("#", "");
    const full = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
    const num = parseInt(full, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
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
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function parseDesign(raw: string): QrDesign {
  return { ...DEFAULT_DESIGN, ...parseJson<QrDesign>(raw, DEFAULT_DESIGN) };
}

export async function renderQrSvg(content: string, designRaw: string) {
  const design = parseDesign(designRaw);
  return QRCode.toString(content, {
    type: "svg",
    errorCorrectionLevel: design.errorCorrectionLevel,
    margin: design.margin,
    color: {
      dark: design.foregroundColor,
      light: design.backgroundColor,
    },
    width: design.size,
  });
}

export async function renderQrPng(content: string, designRaw: string) {
  const design = parseDesign(designRaw);
  return QRCode.toBuffer(content, {
    type: "png",
    errorCorrectionLevel: design.errorCorrectionLevel,
    margin: design.margin,
    color: {
      dark: design.foregroundColor,
      light: design.backgroundColor,
    },
    width: design.size,
  });
}

export async function renderQrJpg(content: string, designRaw: string) {
  const png = await renderQrPng(content, designRaw);
  return png;
}

export type ValidationWarning = {
  level: "error" | "warning";
  message: string;
};

export function validateQrDesign(designRaw: string, contentLength: number) {
  const design = parseDesign(designRaw);
  const warnings: ValidationWarning[] = [];

  if (design.size < 256) {
    warnings.push({ level: "warning", message: "QR kod çok küçük olabilir." });
  }
  if (contrastRatio(design.foregroundColor, design.backgroundColor) < 3) {
    warnings.push({
      level: "warning",
      message: "Arka plan ve QR rengi arasında kontrast düşük.",
    });
  }
  if (design.logoUrl && design.logoSize > 0.28) {
    warnings.push({
      level: "warning",
      message: "Logo boyutu QR okunabilirliğini bozabilir.",
    });
  }
  if (design.margin < 2) {
    warnings.push({ level: "warning", message: "Kenar boşluğu yeterli olmayabilir." });
  }
  if (contentLength > 800) {
    warnings.push({
      level: "warning",
      message: "QR içeriği çok uzun; okunabilirlik düşebilir.",
    });
  }
  return warnings;
}

export async function checkTargetUrl(url?: string | null) {
  if (!url) return { ok: false, message: "Hedef bağlantı tanımlı değil." };
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (!res.ok) return { ok: false, message: "Hedef bağlantı çalışmıyor." };
    return { ok: true, message: "Hedef bağlantı erişilebilir." };
  } catch {
    return { ok: false, message: "Hedef bağlantı doğrulanamadı." };
  }
}
