import type { NextResponse } from "next/server";

const TURNSTILE = "https://challenges.cloudflare.com";

/** Üretim için güvenlik başlıkları + CSP */
export function applySecurityHeaders(res: NextResponse, isProduction = process.env.NODE_ENV === "production") {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-site");

  if (isProduction) {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  const turnstileOn = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const scriptSrc = turnstileOn
    ? `'self' 'unsafe-inline' 'unsafe-eval' ${TURNSTILE}`
    : "'self' 'unsafe-inline' 'unsafe-eval'";
  const frameSrc = turnstileOn ? `'self' ${TURNSTILE}` : "'none'";

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    `frame-src ${frameSrc}`,
    "object-src 'none'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https:",
    "media-src 'self'",
    "worker-src 'self' blob:",
  ].join("; ");

  res.headers.set("Content-Security-Policy", csp);
  return res;
}
