import { checkRateLimit } from "@/lib/security/rate-limit";

const blocked = new Map<string, number>();

export function blockIp(ip: string, durationMs = 60 * 60_000) {
  blocked.set(ip, Date.now() + durationMs);
}

export function isIpBlocked(ip: string): { blocked: boolean; retryAfterSec?: number } {
  const until = blocked.get(ip);
  if (!until) return { blocked: false };
  const now = Date.now();
  if (now >= until) {
    blocked.delete(ip);
    return { blocked: false };
  }
  return { blocked: true, retryAfterSec: Math.ceil((until - now) / 1000) };
}

export function autoBlockOnAbuse(ip: string) {
  const rl = checkRateLimit(`abuse:${ip}`, 8, 60 * 60_000);
  if (!rl.ok) blockIp(ip, 2 * 60 * 60_000);
}
