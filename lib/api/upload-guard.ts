import { validateImageBytes } from "@/lib/security/upload-bytes";

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
]);

const ALLOWED_CATEGORIES = new Set(["logos", "png", "svg", "pdf", "templates", "bulk"]);

export function validateUpload(file: File, category: string) {
  if (!ALLOWED_CATEGORIES.has(category)) {
    return { ok: false as const, error: "Geçersiz yükleme kategorisi." };
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return { ok: false as const, error: "Dosya boyutu en fazla 5 MB olabilir." };
  }
  const mime = (file.type || "").toLowerCase();
  if (category === "logos" || category === "png" || category === "svg") {
    if (!ALLOWED_MIME.has(mime)) {
      return { ok: false as const, error: "Yalnızca PNG, JPEG, WebP veya SVG yüklenebilir." };
    }
  }
  return { ok: true as const };
}

export function validateUploadBytes(buffer: Buffer, file: File, category: string) {
  const mime = (file.type || "").toLowerCase();
  if (category === "logos" || category === "png" || category === "svg") {
    if (!validateImageBytes(buffer, mime)) {
      return { ok: false as const, error: "Dosya içeriği geçersiz veya desteklenmiyor." };
    }
  }
  return { ok: true as const };
}
