import type { NextRequest } from "next/server";

/** İstek IP'si — Vercel/proxy ortamında x-forwarded-for kullanır. */
export function getClientIp(req: NextRequest | Request): string {
  if (req instanceof Request && !("cookies" in req)) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
    return req.headers.get("x-real-ip")?.trim() || "unknown";
  }
  const nextReq = req as NextRequest;
  const forwarded = nextReq.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return nextReq.headers.get("x-real-ip")?.trim() || "unknown";
}
