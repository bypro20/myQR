import { buildRedirectTarget } from "@/lib/qr/generators";
import { parseJson } from "@/lib/utils";

export function resolveRedirectTarget(qr: {
  type: string;
  shortCode: string | null;
  targetUrl: string | null;
  payload: string;
}) {
  return (
    qr.targetUrl?.trim() ||
    buildRedirectTarget({
      type: qr.type,
      shortCode: qr.shortCode,
      targetUrl: qr.targetUrl,
      payload: parseJson(qr.payload, {}),
    })
  );
}
