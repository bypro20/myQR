import QRCode from "qrcode";
import { buildFrameSvg, shouldApplyFrame } from "@/lib/qr/frame";
import { parseDesign, validateQrDesign, type ValidationWarning } from "@/lib/qr/design-validate";
import { DEFAULT_DESIGN, type QrDesign } from "@/lib/qr/types";

async function loadSharp() {
  try {
    const mod = await import("sharp");
    return mod.default;
  } catch (err) {
    console.warn("[render] sharp unavailable:", err);
    return null;
  }
}

async function svgToPng(svg: string) {
  const sharp = await loadSharp();
  if (sharp) {
    try {
      return await sharp(Buffer.from(svg, "utf-8")).png().toBuffer();
    } catch (err) {
      console.warn("[render] sharp svg→png failed:", err);
    }
  }

  try {
    const { Resvg } = await import("@resvg/resvg-js");
    const resvg = new Resvg(svg, { fitTo: { mode: "original" } });
    return Buffer.from(resvg.render().asPng());
  } catch (err) {
    console.warn("[render] resvg unavailable:", err);
    return null;
  }
}

export { parseDesign, validateQrDesign, type ValidationWarning } from "@/lib/qr/design-validate";

async function renderRawQrSvg(content: string, design: QrDesign) {
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

/** Sharp gerektirmeyen — her ortamda çalışır */
export async function renderRawQrPng(content: string, design: QrDesign) {
  const borderW = design.qrBorderEnabled !== false ? Math.max(2, Math.round(design.qrBorderWidth ?? 1.5) * 2) : 0;
  return QRCode.toBuffer(content, {
    type: "png",
    errorCorrectionLevel: design.errorCorrectionLevel,
    margin: design.margin + borderW,
    color: {
      dark: design.foregroundColor,
      light: design.backgroundColor,
    },
    width: design.size,
  });
}

async function renderPngWithSharpExtend(content: string, design: QrDesign) {
  const sharp = await loadSharp();
  if (!sharp) return null;

  const rawPng = await QRCode.toBuffer(content, {
    type: "png",
    errorCorrectionLevel: design.errorCorrectionLevel,
    margin: design.margin,
    color: {
      dark: design.foregroundColor,
      light: design.backgroundColor,
    },
    width: design.size,
  });

  const frameColor = design.frameColor || design.foregroundColor;
  const borderW = design.qrBorderEnabled !== false ? Math.max(1, Math.round(design.qrBorderWidth ?? 1.5)) : 0;
  const pad = design.frameEnabled !== false && design.frameStyle !== "none" ? 28 : 12;

  let img = sharp(rawPng);

  if (borderW > 0) {
    img = img.extend({
      top: borderW,
      bottom: borderW,
      left: borderW,
      right: borderW,
      background: frameColor,
    });
  }

  if (shouldApplyFrame(design)) {
    img = img.extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: design.backgroundColor,
    });
  }

  return img.png().toBuffer();
}

async function renderPngWithSharpSvg(content: string, design: QrDesign) {
  const rawSvg = await renderRawQrSvg(content, design);
  const svg = buildFrameSvg(rawSvg, design);
  return svgToPng(svg);
}

export async function renderQrSvg(content: string, designRaw: string | QrDesign) {
  const design = parseDesign(designRaw);
  const rawSvg = await renderRawQrSvg(content, design);
  return buildFrameSvg(rawSvg, design);
}

export async function renderQrPng(content: string, designRaw: string | QrDesign) {
  const trimmed = content?.trim();
  if (!trimmed) {
    throw new Error("QR içeriği boş.");
  }

  const design = parseDesign(designRaw);

  if (shouldApplyFrame(design)) {
    try {
      const svgPng = await renderPngWithSharpSvg(content, design);
      if (svgPng) return svgPng;
    } catch (err) {
      console.warn("[renderQrPng] SVG frame failed:", err);
    }

    try {
      const extPng = await renderPngWithSharpExtend(content, design);
      if (extPng) return extPng;
    } catch (err) {
      console.warn("[renderQrPng] PNG extend failed:", err);
    }
  } else if (design.qrBorderEnabled !== false) {
    try {
      const sharp = await loadSharp();
      if (sharp) {
        const rawPng = await QRCode.toBuffer(content, {
          type: "png",
          errorCorrectionLevel: design.errorCorrectionLevel,
          margin: design.margin,
          color: { dark: design.foregroundColor, light: design.backgroundColor },
          width: design.size,
        });
        const borderW = Math.max(1, Math.round(design.qrBorderWidth ?? 1.5));
        return sharp(rawPng)
          .extend({
            top: borderW,
            bottom: borderW,
            left: borderW,
            right: borderW,
            background: design.frameColor || design.foregroundColor,
          })
          .png()
          .toBuffer();
      }
    } catch (err) {
      console.warn("[renderQrPng] border extend failed:", err);
    }
  }

  try {
    return await renderRawQrPng(trimmed, design);
  } catch (err) {
    console.error("[renderQrPng] raw fallback failed:", err);
    throw err instanceof Error ? err : new Error("QR görseli oluşturulamadı.");
  }
}

/** Önizleme için — sharp/SVG hatasında bile PNG döner */
export async function renderPreviewPng(content: string, designRaw: string | QrDesign) {
  const trimmed = content?.trim();
  if (!trimmed) throw new Error("QR içeriği boş.");

  const design = parseDesign(designRaw);

  try {
    const png = await renderQrPng(trimmed, design);
    if (png?.length) return png;
  } catch (err) {
    console.warn("[renderPreviewPng] primary render failed:", err);
  }

  try {
    return await renderRawQrPng(trimmed, {
      ...design,
      frameEnabled: false,
      frameStyle: "none",
      qrBorderEnabled: design.qrBorderEnabled !== false,
    });
  } catch (err) {
    console.error("[renderPreviewPng] raw fallback failed:", err);
    throw err instanceof Error ? err : new Error("QR görseli oluşturulamadı.");
  }
}

export async function renderQrJpg(content: string, designRaw: string | QrDesign) {
  const png = await renderQrPng(content, designRaw);
  const sharp = await loadSharp();
  if (!sharp) throw new Error("JPEG dönüşümü için sharp gerekli.");
  return sharp(png).jpeg({ quality: 92 }).toBuffer();
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
