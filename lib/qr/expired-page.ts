import { getAppUrlFromHeaders } from "@/lib/utils";
import { durationTierLabel } from "@/lib/qr/duration";

export function qrExpiredHtml(opts: {
  qrName: string;
  qrId: string;
  shortCode: string;
  expiredAt: Date;
  durationTier: string;
  headers: Headers;
}) {
  const appUrl = getAppUrlFromHeaders(opts.headers);
  const renewUrl = `${appUrl}/dashboard/qr/${opts.qrId}`;
  const billingUrl = `${appUrl}/dashboard/billing`;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>QR Süresi Doldu — myQR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      max-width: 440px;
      width: 100%;
      background: rgba(255,255,255,0.97);
      color: #1e1b4b;
      border-radius: 24px;
      padding: 36px 32px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.35);
      text-align: center;
    }
    .icon {
      width: 64px; height: 64px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #f97316, #ef4444);
      border-radius: 18px;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px;
    }
    h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; }
    p { color: #64748b; font-size: 0.95rem; line-height: 1.6; margin-bottom: 8px; }
    .meta {
      margin: 20px 0;
      padding: 14px;
      background: #f8fafc;
      border-radius: 12px;
      font-size: 0.85rem;
      color: #475569;
      text-align: left;
    }
    .meta strong { color: #1e1b4b; }
    .btn {
      display: block;
      width: 100%;
      padding: 14px 20px;
      margin-top: 12px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      transition: transform 0.15s;
    }
    .btn:hover { transform: scale(1.02); }
    .btn-primary {
      background: linear-gradient(135deg, #7c3aed, #2563eb);
      color: #fff;
    }
    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
    }
    .brand { margin-top: 24px; font-size: 0.75rem; color: #94a3b8; }
    .brand a { color: #7c3aed; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⏱</div>
    <h1>QR Kodu Süresi Doldu</h1>
    <p><strong>${escapeHtml(opts.qrName)}</strong> artık yönlendirme yapmıyor.</p>
    <p>Devam etmek için süre paketi seçin veya kredi yükleyin.</p>
    <div class="meta">
      <div><strong>Plan:</strong> ${escapeHtml(durationTierLabel(opts.durationTier))}</div>
      <div><strong>Bitiş:</strong> ${opts.expiredAt.toLocaleDateString("tr-TR")}</div>
      <div><strong>Kod:</strong> /q/${escapeHtml(opts.shortCode)}</div>
    </div>
    <a class="btn btn-primary" href="${renewUrl}">Süreyi Uzat</a>
    <a class="btn btn-secondary" href="${billingUrl}">Kredi Paketi Al</a>
    <a class="btn btn-secondary" href="${appUrl}/login">Hesabıma Giriş Yap</a>
    <p class="brand">Powered by <a href="${appUrl}">myQR</a></p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
