import { createHash } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { safeFileName } from "@/lib/utils";

const UPLOAD_ROOT = process.env.VERCEL
  ? path.join("/tmp", "myqr-uploads", "qr")
  : path.join(process.cwd(), "uploads", "qr");

export const UPLOAD_DIRS = {
  logos: path.join(UPLOAD_ROOT, "logos"),
  png: path.join(UPLOAD_ROOT, "png"),
  svg: path.join(UPLOAD_ROOT, "svg"),
  pdf: path.join(UPLOAD_ROOT, "pdf"),
  templates: path.join(UPLOAD_ROOT, "templates"),
  bulk: path.join(UPLOAD_ROOT, "bulk"),
} as const;

export async function ensureUploadDirs() {
  await Promise.all(Object.values(UPLOAD_DIRS).map((dir) => mkdir(dir, { recursive: true })));
}

export async function saveUpload(
  category: keyof typeof UPLOAD_DIRS,
  fileName: string,
  data: Buffer | string,
) {
  const safe = safeFileName(fileName);
  try {
    await ensureUploadDirs();
    const fullPath = path.join(UPLOAD_DIRS[category], safe);
    await writeFile(fullPath, data);
    const publicRoot = process.env.VERCEL ? "" : "/uploads/qr";
    return {
      fileName: safe,
      path: publicRoot ? `${publicRoot}/${category}/${safe}` : "",
      absolutePath: fullPath,
    };
  } catch (err) {
    console.warn("[saveUpload] archive skipped:", err);
    return { fileName: safe, path: "", absolutePath: "" };
  }
}

export function hashIp(ip: string) {
  return createHash("sha256").update(`${ip}:${process.env.AUTH_SECRET || "myqr"}`).digest("hex").slice(0, 24);
}

export function detectDevice(userAgent: string) {
  const ua = userAgent.toLowerCase();
  const deviceType = /mobile|android|iphone|ipad/.test(ua) ? "mobile" : "desktop";
  let os = "unknown";
  if (/windows/.test(ua)) os = "Windows";
  else if (/mac os|macintosh/.test(ua)) os = "macOS";
  else if (/android/.test(ua)) os = "Android";
  else if (/iphone|ipad|ios/.test(ua)) os = "iOS";
  else if (/linux/.test(ua)) os = "Linux";

  let browser = "unknown";
  if (/edg\//.test(ua)) browser = "Edge";
  else if (/chrome\//.test(ua)) browser = "Chrome";
  else if (/safari\//.test(ua) && !/chrome/.test(ua)) browser = "Safari";
  else if (/firefox\//.test(ua)) browser = "Firefox";

  return { deviceType, os, browser };
}
