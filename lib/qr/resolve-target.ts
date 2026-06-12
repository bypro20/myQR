import { parseJson } from "@/lib/utils";

export function resolveRedirectTarget(qr: {
  type: string;
  targetUrl: string | null;
  payload: string;
}) {
  if (qr.targetUrl) return qr.targetUrl;
  const payload = parseJson<Record<string, string>>(qr.payload, {});
  return payload.url || payload.link || null;
}
