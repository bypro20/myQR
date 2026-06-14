import type { NextRequest } from "next/server";

const BAD_UA = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /acunetix/i,
  /nessus/i,
  /dirbuster/i,
  /gobuster/i,
  /wget/i,
  /curl\/[0-7]\./i,
  /python-requests/i,
  /scrapy/i,
  /headless/i,
];

const URL_ATTACK_PATTERNS = [
  /union\s+select/i,
  /\<script/i,
  /\.\.\//,
  /%2e%2e%2f/i,
  /eval\s*\(/i,
  /base64_decode/i,
  /\/etc\/passwd/i,
  /wp-config/i,
  /php:\/\//i,
];

const EXTRA_PROBES = [
  "/cgi-bin",
  "/shell",
  "/backup",
  "/database",
  "/config",
  "/aws",
  "/.aws",
  "/server-status",
  "/actuator",
  "/telescope",
  "/vendor/phpunit",
  "/containers/json",
];

export function getExtraProbePaths() {
  return EXTRA_PROBES;
}

export function isSuspiciousBot(req: NextRequest): boolean {
  const ua = req.headers.get("user-agent") || "";
  if (!ua.trim()) return req.nextUrl.pathname.startsWith("/api");
  return BAD_UA.some((re) => re.test(ua));
}

export function hasMaliciousPayload(pathname: string, search: string): boolean {
  const combined = `${pathname}${search}`;
  return URL_ATTACK_PATTERNS.some((re) => re.test(combined));
}

export function isDangerousMethod(method: string) {
  return ["TRACE", "TRACK", "CONNECT"].includes(method.toUpperCase());
}
