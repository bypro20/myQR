import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const COOKIE = "myqr_session";
const rateMap = new Map<string, { count: number; reset: number }>();

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
  return NextResponse.redirect(url, 308);
}

function rateLimit(ip: string, limit = 300, windowMs = 60_000) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

async function getSessionRole(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return null;
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return String(payload.systemRole || "");
  } catch {
    return null;
  }
}

async function isAuthed(req: NextRequest) {
  return (await getSessionRole(req)) !== null;
}

function isAdminRole(role: string | null) {
  return role === "SUPER_ADMIN" || role === "PLATFORM_ADMIN";
}

function securityHeaders(res: NextResponse) {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  if (process.env.NODE_ENV === "production") {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return res;
}

export async function middleware(req: NextRequest) {
  const canonicalRedirect = redirectToCanonical(req);
  if (canonicalRedirect) {
    return securityHeaders(canonicalRedirect);
  }

  const { pathname } = req.nextUrl;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  if (pathname.startsWith("/api") && !rateLimit(ip)) {
    return securityHeaders(NextResponse.json({ error: "Çok fazla istek." }, { status: 429 }));
  }

  const role = await getSessionRole(req);
  const authed = role !== null;

  // /register → /signup (yaygın URL beklentisi; giriş yapmışsa doğrudan panele)
  if (pathname === "/register" || pathname === "/register/") {
    const dest = authed ? (isAdminRole(role) ? "/admin" : "/dashboard") : "/signup";
    return securityHeaders(NextResponse.redirect(new URL(dest, req.url), 308));
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!authed) {
      return securityHeaders(NextResponse.redirect(new URL("/admin/login", req.url)));
    }
    if (!isAdminRole(role)) {
      return securityHeaders(NextResponse.redirect(new URL("/dashboard", req.url)));
    }
  }

  if (pathname === "/admin/login" && authed && isAdminRole(role)) {
    return securityHeaders(NextResponse.redirect(new URL("/admin", req.url)));
  }

  if (pathname.startsWith("/dashboard")) {
    if (!authed) {
      return securityHeaders(NextResponse.redirect(new URL("/login", req.url)));
    }
  }

  if ((pathname === "/login" || pathname === "/signup") && authed) {
    const dest = isAdminRole(role) ? "/admin" : "/dashboard";
    return securityHeaders(NextResponse.redirect(new URL(dest, req.url)));
  }

  return securityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
