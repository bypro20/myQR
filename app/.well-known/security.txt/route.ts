import { NextResponse } from "next/server";

const CONTACT = process.env.SECURITY_CONTACT_EMAIL || "guvenlik@myqar.net";

export function GET() {
  const body = [
    "Contact: mailto:" + CONTACT,
    "Preferred-Languages: tr, en",
    "Canonical: https://myqar.net/.well-known/security.txt",
    "Policy: https://myqar.net/gizlilik-politikasi",
    "Expires: " + new Date(Date.now() + 365 * 24 * 60 * 60_000).toISOString().slice(0, 10),
    "",
    "# Güvenlik açığı bildirimi",
    "# Lütfen sorumlu açıklama (responsible disclosure) ilkesine uyun.",
  ].join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
