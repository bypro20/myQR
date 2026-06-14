import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/security/client-ip";
import { applySecurityHeaders } from "@/lib/security/headers";
import { checkRateLimit, getRouteLimit } from "@/lib/security/rate-limit";
import {
  getExtraProbePaths,
  hasMaliciousPayload,
  isDangerousMethod,
  isSuspiciousBot,
} from "@/lib/security/bot-shield";
import { autoBlockOnAbuse, isIpBlocked } from "@/lib/security/ip-block";
import { verifyApiOrigin } from "@/lib/security/origin-shield";

const COOKIE = "myqr_session";

const PROBE_PATHS = [
  "/.env",
  "/.git",
  "/wp-admin",
  "/wp-login.php",
  "/phpmyadmin",
  "/admin.php",
  "/xmlrpc.php",
  ...getExtraProbePaths(),
];

function canonicalHost() {
  const url = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!url) return "myqar.net";
  try {
    return new URL(url).host;
  } catch {
    return "myqar.net";
  }
}

function isVercelHost(host: string) {
  return host.includes("vercel.app") || host.includes("vercel.sh");
}

function redirectToCanonical(req: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") return null;

  const host = (req.headers.get("host") || "").split(":")[0]?.toLowerCase();
  const canonical = canonicalHost();
  if (!host || !isVercelHost(host) || host === canonical) return null;

  const url = req.nextUrl.clone();
  url.protocol = "https:";
  url.host = canonical;
  return applySecurityHeaders(NextResponse.redirect(url, 308));
}

async function getSessionRole(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret || secret.length < 32) return null;
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return String(payload.systemRole || "");
  } catch {
    return null;
  }
}

function isAdminRole(role: string | null) {
  return role === "SUPER_ADMIN" || role === "PLATFORM_ADMIN";
}

function isProbe(pathname: string) {
  const lower = pathname.toLowerCase();
  return PROBE_PATHS.some((p) => lower === p || lower.startsWith(`${p}/`));
}

function blockResponse(retryAfterSec?: number) {
  const headers: Record<string, string> = {};
  if (retryAfterSec) headers["Retry-After"] = String(retryAfterSec);
  return applySecurityHeaders(new NextResponse(null, { status: 403, headers }));
}

export async function middleware(req: NextRequest) {
  const canonicalRedirect = redirectToCanonical(req);
  if (canonicalRedirect) return canonicalRedirect;

  const { pathname, search } = req.nextUrl;

  if (isDangerousMethod(req.method)) {
    return applySecurityHeaders(new NextResponse(null, { status: 405 }));
  }

  const ip = getClientIp(req);
  const ipBlock = isIpBlocked(ip);
  if (ipBlock.blocked) {
    return blockResponse(ipBlock.retryAfterSec);
  }

  if (isProbe(pathname) || hasMaliciousPayload(pathname, search)) {
    autoBlockOnAbuse(ip);
    return applySecurityHeaders(new NextResponse(null, { status: 404 }));
  }

  if (isSuspiciousBot(req) && pathname.startsWith("/api")) {
    autoBlockOnAbuse(ip);
    return blockResponse();
  }

  if (pathname.startsWith("/api") && !verifyApiOrigin(req)) {
    return applySecurityHeaders(
      NextResponse.json({ error: "İstek reddedildi." }, { status: 403 }),
    );
  }

  if (pathname.startsWith("/api")) {
    const { limit, windowMs } = getRouteLimit(pathname);
    const rl = checkRateLimit(`api:${ip}:${pathname}`, limit, windowMs);
    if (!rl.ok) {
      autoBlockOnAbuse(ip);
      return applySecurityHeaders(
        NextResponse.json(
          { error: "Çok fazla istek. Lütfen biraz bekleyin." },
          { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
        ),
      );
    }
  }

  if (pathname.startsWith("/q/")) {
    const rl = checkRateLimit(`scan:${ip}`, 120, 60_000);
    if (!rl.ok) {
      return applySecurityHeaders(new NextResponse("Çok fazla istek.", { status: 429 }));
    }
  }

  const role = await getSessionRole(req);
  const authed = role !== null;

  if (pathname === "/register" || pathname === "/register/") {
    const dest = authed ? (isAdminRole(role) ? "/admin" : "/dashboard") : "/signup";
    return applySecurityHeaders(NextResponse.redirect(new URL(dest, req.url), 308));
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!authed) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/admin/login", req.url)));
    }
    if (!isAdminRole(role)) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", req.url)));
    }
  }

  if (pathname === "/admin/login" && authed && isAdminRole(role)) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/admin", req.url)));
  }

  if (pathname.startsWith("/dashboard")) {
    if (!authed) {
      return applySecurityHeaders(NextResponse.redirect(new URL("/login", req.url)));
    }
  }

  if (pathname.startsWith("/api/admin") && !authed) {
    return applySecurityHeaders(NextResponse.json({ error: "Oturum gerekli." }, { status: 401 }));
  }

  if (pathname.startsWith("/api/partner") && !authed) {
    return applySecurityHeaders(NextResponse.json({ error: "Oturum gerekli." }, { status: 401 }));
  }

  if ((pathname === "/login" || pathname === "/signup") && authed) {
    const dest = isAdminRole(role) ? "/admin" : "/dashboard";
    return applySecurityHeaders(NextResponse.redirect(new URL(dest, req.url)));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
