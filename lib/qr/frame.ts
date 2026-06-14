import type { QrDesign } from "@/lib/qr/types";

export type FrameLayout = {
  width: number;
  height: number;
  qrX: number;
  qrY: number;
  qrSize: number;
  cardX: number;
  cardY: number;
  cardW: number;
  cardH: number;
  borderPad: number;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function extractQrSvgInner(svg: string) {
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch?.[1] || "0 0 100 100";
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/i, "").replace(/<\/svg>\s*$/i, "");
  return { viewBox, inner };
}

export function shouldApplyFrame(design: QrDesign) {
  if (design.frameEnabled === false || design.frameStyle === "none") {
    return Boolean(design.title?.trim() || design.caption?.trim() || design.qrBorderEnabled !== false);
  }
  return true;
}

export function computeFrameLayout(design: QrDesign): FrameLayout {
  const qrSize = design.size;
  const outer = 40;
  const framePad = 28;
  const borderPad = design.qrBorderEnabled !== false ? 10 : 0;
  const titleH = design.title?.trim() ? 44 : 0;
  const captionH = design.caption?.trim() ? 34 : 0;
  const scanH =
    design.frameEnabled !== false && design.showScanLabel !== false ? 26 : 0;

  const innerQr = qrSize + borderPad * 2;
  const cardW = innerQr + framePad * 2;
  const cardH = titleH + innerQr + captionH + scanH + framePad * 2;
  const width = cardW + outer * 2;
  const height = cardH + outer * 2;

  return {
    width,
    height,
    cardX: outer,
    cardY: outer,
    cardW,
    cardH,
    borderPad,
    qrX: outer + framePad + borderPad,
    qrY: outer + framePad + titleH + borderPad,
    qrSize,
  };
}

function frameDecor(
  style: QrDesign["frameStyle"],
  layout: FrameLayout,
  frameColor: string,
  bg: string,
) {
  const { cardX, cardY, cardW, cardH } = layout;
  const r = style === "minimal" ? 12 : style === "modern" ? 26 : 20;

  if (style === "classic") {
    return `
      <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${r}" fill="${bg}" stroke="${frameColor}" stroke-width="4"/>
      <rect x="${cardX + 9}" y="${cardY + 9}" width="${cardW - 18}" height="${cardH - 18}" rx="${r - 4}" fill="none" stroke="${frameColor}" stroke-width="1.5" opacity="0.32"/>
      <rect x="${cardX + 18}" y="${cardY + 18}" width="${cardW - 36}" height="${cardH - 36}" rx="${r - 8}" fill="none" stroke="${frameColor}" stroke-width="0.75" opacity="0.18"/>
    `;
  }

  if (style === "modern") {
    return `
      <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${r}" fill="${bg}" stroke="${frameColor}" stroke-width="5"/>
      <rect x="${cardX + 6}" y="${cardY + 6}" width="${cardW - 12}" height="6" rx="3" fill="${frameColor}" opacity="0.15"/>
    `;
  }

  if (style === "premium") {
    return `
      <defs>
        <linearGradient id="qrFrameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${frameColor}"/>
          <stop offset="50%" stop-color="#9333ea"/>
          <stop offset="100%" stop-color="#2563eb"/>
        </linearGradient>
      </defs>
      <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${r}" fill="${bg}"/>
      <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${r}" fill="none" stroke="url(#qrFrameGrad)" stroke-width="5"/>
      <rect x="${cardX + 10}" y="${cardY + 10}" width="${cardW - 20}" height="${cardH - 20}" rx="${r - 6}" fill="none" stroke="${frameColor}" stroke-width="1" opacity="0.22"/>
    `;
  }

  return `
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="${r}" fill="${bg}" stroke="${frameColor}" stroke-width="2.5"/>
  `;
}

/** İnce profesyonel QR matris çerçevesi */
function qrMatrixBorder(layout: FrameLayout, design: QrDesign, frameColor: string, bg: string) {
  if (design.qrBorderEnabled === false) return "";

  const stroke = design.qrBorderWidth ?? 1.5;
  const pad = layout.borderPad;
  const x = layout.qrX - pad;
  const y = layout.qrY - pad;
  const w = layout.qrSize + pad * 2;
  const h = layout.qrSize + pad * 2;

  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${bg}" stroke="${frameColor}" stroke-width="${stroke}"/>
    <rect x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="4" fill="none" stroke="${frameColor}" stroke-width="0.5" opacity="0.25"/>
  `;
}

export function buildFrameSvg(qrSvg: string, design: QrDesign): string {
  if (!shouldApplyFrame(design)) return qrSvg;

  const { viewBox, inner } = extractQrSvgInner(qrSvg);
  const layout = computeFrameLayout(design);
  const frameColor = design.frameColor || design.foregroundColor;
  const bg = design.backgroundColor;
  const style = design.frameStyle || "minimal";
  const title = design.title?.trim() || "";
  const caption = design.caption?.trim() || "";
  const showScan = design.showScanLabel !== false && design.frameEnabled !== false;
  const fullCard = design.frameEnabled !== false && design.frameStyle !== "none";

  const titleEl = title
    ? `<text x="${layout.width / 2}" y="${layout.qrY - layout.borderPad - 14}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="700" fill="${frameColor}">${escapeXml(title)}</text>`
    : "";

  const captionEl = caption
    ? `<text x="${layout.width / 2}" y="${layout.qrY + layout.qrSize + layout.borderPad + 26}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="13" fill="${frameColor}" opacity="0.72">${escapeXml(caption)}</text>`
    : "";

  const scanY = layout.qrY + layout.qrSize + layout.borderPad + (caption ? 44 : 28);
  const scanEl = showScan && fullCard
    ? `<text x="${layout.width / 2}" y="${scanY}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="10" font-weight="700" letter-spacing="2.5" fill="${frameColor}" opacity="0.5">TARAYIN</text>`
    : "";

  const decor = fullCard
    ? frameDecor(style, layout, frameColor, bg)
    : `<rect x="${layout.cardX}" y="${layout.cardY}" width="${layout.cardW}" height="${layout.cardH}" rx="16" fill="${fullCard ? bg : "#f8fafc"}"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}">
  <rect width="100%" height="100%" fill="#f8fafc"/>
  ${decor}
  ${titleEl}
  ${qrMatrixBorder(layout, design, frameColor, bg)}
  <svg x="${layout.qrX}" y="${layout.qrY}" width="${layout.qrSize}" height="${layout.qrSize}" viewBox="${viewBox}">
    ${inner}
  </svg>
  ${captionEl}
  ${scanEl}
</svg>`;
}
