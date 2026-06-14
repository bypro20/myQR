const SIGNATURES: Array<{ mime: string; check: (buf: Buffer) => boolean }> = [
  { mime: "image/png", check: (b) => b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  {
    mime: "image/jpeg",
    check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: "image/webp",
    check: (b) =>
      b.length >= 12 &&
      b.toString("ascii", 0, 4) === "RIFF" &&
      b.toString("ascii", 8, 12) === "WEBP",
  },
];

export function validateImageBytes(buffer: Buffer, declaredMime: string): boolean {
  const mime = declaredMime.toLowerCase();
  if (mime === "image/svg+xml") {
    const text = buffer.toString("utf8", 0, Math.min(buffer.length, 4096)).toLowerCase();
    if (text.includes("<script") || text.includes("javascript:") || text.includes("onload=")) {
      return false;
    }
    return text.includes("<svg");
  }
  const sig = SIGNATURES.find((s) => s.mime === mime);
  if (!sig) return false;
  return sig.check(buffer);
}
