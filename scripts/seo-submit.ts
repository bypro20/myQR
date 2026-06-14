import { INDEXABLE_PAGES } from "@/lib/seo/pages";
import { absoluteUrl } from "@/lib/seo/site-config";

const INDEXNOW_KEY = process.env.INDEXNOW_KEY?.trim() || "myqr2026indexnowkey8f3a";

async function ping(url: string) {
  try {
    const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(15_000) });
    const text = await res.text();
    return { url, ok: res.ok, status: res.status, body: text.slice(0, 200) };
  } catch (err) {
    return { url, ok: false, status: 0, body: String(err) };
  }
}

async function indexNowSubmit(siteUrl: string) {
  const key = INDEXNOW_KEY;
  const keyLocation = `${siteUrl}/${key}.txt`;
  const urls = INDEXABLE_PAGES.map((p) => absoluteUrl(p.path));

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(siteUrl).host,
        key,
        keyLocation,
        urlList: urls,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    return { ok: res.ok || res.status === 202, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: String(err) };
  }
}

async function main() {
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://myqar.net").replace(/\/$/, "");
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  const encoded = encodeURIComponent(sitemapUrl);

  console.log(`SEO gönderimi: ${siteUrl}\n`);

  const results = await Promise.all([
    ping(`https://www.google.com/ping?sitemap=${encoded}`),
    ping(`https://www.bing.com/ping?sitemap=${encoded}`),
    ping(`${siteUrl}/robots.txt`),
    ping(sitemapUrl),
  ]);

  for (const r of results) {
    console.log(`${r.ok ? "✓" : "✗"} [${r.status}] ${r.url}`);
    if (!r.ok && r.body) console.log(`  ${r.body}`);
  }

  const indexNow = await indexNowSubmit(siteUrl);
  console.log(
    `\nIndexNow: ${indexNow.ok ? "✓" : "✗"} (HTTP ${indexNow.status})`,
    "error" in indexNow ? indexNow.error : "",
  );

  console.log(`
Google Search Console (tek seferlik):
  1. https://search.google.com/search-console adresine gidin
  2. "Mülk ekle" → URL öneki: ${siteUrl}
  3. Doğrulama: HTML etiketi → GOOGLE_SITE_VERIFICATION env değişkenine yapıştırın
  4. Site Haritaları → ${sitemapUrl} ekleyin

Bing Webmaster:
  https://www.bing.com/webmasters → aynı sitemap URL'sini ekleyin
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
