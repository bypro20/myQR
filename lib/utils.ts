import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function safeFileName(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "file";
}

function normalizeUrl(url: string) {
  return url.replace(/\/$/, "");
}

function isVercelHost(host: string) {
  return host.includes("vercel.app") || host.includes("vercel.sh");
}

/** Canonical public URL for QR short links — never a deployment preview URL. */
export function getAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured && !isVercelHost(new URL(configured).host)) {
    return configured;
  }

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/^https?:\/\//, "");
  if (production && configured && isVercelHost(production)) {
    return configured;
  }
  if (production && !isVercelHost(production)) {
    return normalizeUrl(`https://${production}`);
  }

  if (configured) return configured;

  const vercel = process.env.VERCEL_URL;
  if (vercel) return normalizeUrl(`https://${vercel}`);

  return "http://localhost:3000";
}

export function getAppUrlFromHeaders(headers: Headers) {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  const host = (headers.get("x-forwarded-host") || headers.get("host") || "")
    .split(",")[0]
    ?.trim();

  if (host && !host.includes("localhost") && !isVercelHost(host)) {
    return normalizeUrl(`https://${host}`);
  }

  return getAppUrl();
}

export async function getAppUrlFromRequest() {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    return getAppUrlFromHeaders(h);
  } catch {
    return getAppUrl();
  }
}

export function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function formatCreditsDisplay(credits: number, unlimitedCredits?: boolean) {
  if (unlimitedCredits) return "∞";
  return credits.toLocaleString("tr-TR");
}
