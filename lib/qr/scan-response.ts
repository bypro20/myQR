import { escapeHtml } from "@/lib/api/public-form-guard";
import { buildDirectContent, buildRedirectTarget } from "@/lib/qr/generators";
import { parseJson } from "@/lib/utils";
import type { WifiPayload } from "@/lib/qr/types";

export type ScanResponse =
  | { kind: "redirect"; url: string }
  | { kind: "wifi"; payload: WifiPayload }
  | { kind: "vcard"; content: string; fileName: string }
  | { kind: "error"; message: string };

export function resolveScanResponse(
  qr: {
    type: string;
    name: string;
    shortCode: string | null;
    targetUrl: string | null;
    payload: string;
  },
  baseUrl: string,
): ScanResponse {
  const payload = parseJson<Record<string, unknown>>(qr.payload, {});

  if (qr.type === "WIFI") {
    const wp = payload as WifiPayload;
    if (!wp.ssid) return { kind: "error", message: "Wi-Fi bilgisi tanımlı değil." };
    return { kind: "wifi", payload: wp };
  }

  if (qr.type === "VCARD" || qr.type === "ME_CARD") {
    const content = buildDirectContent({
      type: qr.type,
      shortCode: qr.shortCode,
      targetUrl: qr.targetUrl,
      payload,
      baseUrl,
    });
    if (!content) return { kind: "error", message: "Kartvizit bilgisi tanımlı değil." };
    return { kind: "vcard", content, fileName: `${qr.name || "contact"}.vcf` };
  }

  const target =
    qr.targetUrl?.trim() ||
    buildRedirectTarget({
      type: qr.type,
      shortCode: qr.shortCode,
      targetUrl: qr.targetUrl,
      payload,
      baseUrl,
    });

  if (!target) return { kind: "error", message: "Hedef bağlantı tanımlı değil." };

  if (target.startsWith("/")) {
    return { kind: "redirect", url: `${baseUrl.replace(/\/$/, "")}${target}` };
  }

  return { kind: "redirect", url: target };
}

export function wifiLandingHtml(payload: WifiPayload) {
  const ssid = escapeHtml(payload.ssid || "");
  const password = escapeHtml(payload.password || "—");
  const enc =
    payload.encryption === "nopass" ? "Şifresiz" : payload.encryption === "WEP" ? "WEP" : "WPA/WPA2";
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'" />
  <title>Wi-Fi — ${ssid}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f5f3ff; margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; }
    .card { background: white; border-radius: 24px; padding: 32px; max-width: 420px; width: 100%; box-shadow: 0 20px 50px rgba(91, 33, 182, 0.12); }
    h1 { margin: 0 0 8px; color: #4c1d95; font-size: 1.5rem; }
    p { color: #64748b; margin: 0 0 20px; }
    dl { display: grid; gap: 12px; margin: 0; }
    div { background: #faf5ff; border-radius: 12px; padding: 12px 14px; }
    dt { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #7c3aed; margin-bottom: 4px; }
    dd { margin: 0; font-size: 18px; font-weight: 600; color: #1e1b4b; word-break: break-all; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Wi-Fi Bağlantısı</h1>
    <p>Aşağıdaki bilgilerle ağa bağlanabilirsiniz.</p>
    <dl>
      <div><dt>Ağ adı</dt><dd>${ssid}</dd></div>
      <div><dt>Şifre</dt><dd>${password}</dd></div>
      <div><dt>Güvenlik</dt><dd>${enc}</dd></div>
    </dl>
  </div>
</body>
</html>`;
}
