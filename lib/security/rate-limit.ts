type Entry = { count: number; reset: number };

const store = new Map<string, Entry>();

const MAX_KEYS = 20_000;

function prune(now: number) {
  if (store.size < MAX_KEYS) return;
  for (const [key, entry] of store) {
    if (now > entry.reset) store.delete(key);
    if (store.size < MAX_KEYS * 0.8) break;
  }
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number };

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  prune(now);
  const entry = store.get(key);

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((entry.reset - now) / 1000) };
  }

  return { ok: true, remaining: limit - entry.count };
}

export function rateLimitResponse(retryAfterSec: number) {
  return new Response(
    JSON.stringify({ error: "Çok fazla istek. Lütfen biraz bekleyin." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
    },
  );
}

/** Middleware / API için yol bazlı limitler */
export const ROUTE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  "/api/auth/login": { limit: 12, windowMs: 60_000 },
  "/api/auth/admin-login": { limit: 8, windowMs: 60_000 },
  "/api/auth/signup": { limit: 6, windowMs: 60_000 },
  "/api/billing/iyzico/callback": { limit: 30, windowMs: 60_000 },
  "/api/billing/webhook": { limit: 60, windowMs: 60_000 },
  "/api/partner/customers": { limit: 30, windowMs: 60_000 },
};

export function getRouteLimit(pathname: string) {
  return ROUTE_LIMITS[pathname] ?? { limit: 180, windowMs: 60_000 };
}
