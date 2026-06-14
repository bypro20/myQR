import type { NextRequest } from "next/server";

const WEBHOOK_PATHS = [
  "/api/billing/webhook",
  "/api/billing/iyzico/callback",
  "/api/billing/posnet/callback",
];

function allowedHosts(): string[] {
  const hosts = new Set<string>();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      hosts.add(new URL(appUrl).host.toLowerCase());
    } catch {
      /* ignore */
    }
  }
  hosts.add("myqar.net");
  hosts.add("www.myqar.net");
  hosts.add("localhost");
  hosts.add("127.0.0.1");
  if (process.env.VERCEL_URL) hosts.add(process.env.VERCEL_URL.toLowerCase());
  return [...hosts];
}

export function verifyApiOrigin(req: NextRequest): boolean {
  const pathname = req.nextUrl.pathname;
  if (WEBHOOK_PATHS.some((p) => pathname.startsWith(p))) return true;
  if (process.env.NODE_ENV !== "production") return true;

  const method = req.method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return true;
  if (!pathname.startsWith("/api")) return true;

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const hosts = allowedHosts();

  if (origin) {
    try {
      return hosts.includes(new URL(origin).host.toLowerCase());
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      return hosts.includes(new URL(referer).host.toLowerCase());
    } catch {
      return false;
    }
  }

  return false;
}
