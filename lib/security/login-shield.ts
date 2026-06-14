import { blockIp } from "@/lib/security/ip-block";

type LockEntry = { failures: number; reset: number; blockedUntil?: number };

const locks = new Map<string, LockEntry>();

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60_000;
const BLOCK_MS = 30 * 60_000;

function key(ip: string, email?: string) {
  return email ? `login:${ip}:${email.toLowerCase()}` : `login:${ip}`;
}

export function isLoginBlocked(ip: string, email?: string): { blocked: boolean; retryAfterSec?: number } {
  const now = Date.now();
  for (const k of [key(ip, email), key(ip)]) {
    const entry = locks.get(k);
    if (entry?.blockedUntil && now < entry.blockedUntil) {
      return { blocked: true, retryAfterSec: Math.ceil((entry.blockedUntil - now) / 1000) };
    }
    if (entry?.blockedUntil && now >= entry.blockedUntil) {
      locks.delete(k);
    }
  }
  return { blocked: false };
}

export function recordLoginFailure(ip: string, email?: string) {
  const now = Date.now();
  const k = key(ip, email);
  const entry = locks.get(k);

  if (!entry || now > entry.reset) {
    locks.set(k, { failures: 1, reset: now + WINDOW_MS });
    return;
  }

  entry.failures += 1;
  if (entry.failures >= MAX_FAILURES) {
    entry.blockedUntil = now + BLOCK_MS;
    blockIp(ip, BLOCK_MS);
  }
}

export function clearLoginFailures(ip: string, email?: string) {
  locks.delete(key(ip, email));
  locks.delete(key(ip));
}

/** Brute-force’u yavaşlat */
export async function loginDelay(ms = 400) {
  await new Promise((r) => setTimeout(r, ms));
}
