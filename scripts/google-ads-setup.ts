#!/usr/bin/env tsx
/**
 * Google Ads env doğrulama + kampanya özeti yazdırır.
 * Kullanım: npx tsx scripts/google-ads-setup.ts
 * Env dosyası: .env.google-ads (gitignore'da) veya ortam değişkenleri
 */
import { readFileSync, existsSync, writeFileSync } from "fs";
import { resolve } from "path";
import {
  GOOGLE_ADS_CAMPAIGNS,
  GOOGLE_ADS_EXTENSIONS,
  GOOGLE_ADS_INTake_FIELDS,
  GOOGLE_ADS_NEGATIVE_KEYWORDS,
  GOOGLE_ADS_NEVER_SHARE,
  dailyBudgetSplit,
} from "../lib/marketing/google-ads-playbook";
import {
  GA4_MEASUREMENT_ID,
  GOOGLE_ADS_ID,
  GOOGLE_ADS_PURCHASE_SEND_TO,
  GOOGLE_ADS_SIGNUP_SEND_TO,
  isGoogleTagsEnabled,
} from "../lib/marketing/google-ads-config";

function loadDotEnv(path: string) {
  if (!existsSync(path)) return;
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnv(resolve(process.cwd(), ".env.google-ads"));
loadDotEnv(resolve(process.cwd(), ".env.production"));

const dailyBudget = Number(process.env.GOOGLE_ADS_DAILY_BUDGET_TRY || "150");

console.log("\n═══ myQR Google Ads Kurulum Durumu ═══\n");

console.log("Site etiketleri:");
console.log(`  GA4:              ${GA4_MEASUREMENT_ID || "— (opsiyonel)"}`);
console.log(`  Google Ads ID:    ${GOOGLE_ADS_ID || "— EKSİK"}`);
console.log(`  Kayıt send_to:    ${GOOGLE_ADS_SIGNUP_SEND_TO || "— EKSİK"}`);
console.log(`  Ödeme send_to:    ${GOOGLE_ADS_PURCHASE_SEND_TO || "— (opsiyonel)"}`);
console.log(`  Site hazır:       ${isGoogleTagsEnabled() ? "✓ Evet" : "✗ ID bekleniyor"}`);

console.log("\nAsla paylaşmayın:", GOOGLE_ADS_NEVER_SHARE.join(", "));

console.log("\nGerekli bilgiler ( .env.google-ads dosyasına yazın ):");
for (const f of GOOGLE_ADS_INTake_FIELDS) {
  console.log(`  # ${f.label}${f.required ? " *" : ""}`);
  console.log(`  # örnek: ${f.example}`);
}

console.log(`\nGünlük bütçe dağılımı (${dailyBudget} ₺/gün):`);
for (const row of dailyBudgetSplit(dailyBudget)) {
  console.log(`  ${row.campaign.padEnd(28)} ${row.dailyTry} ₺`);
}

console.log("\n── Kampanyalar (ads.google.com'a kopyala) ──\n");
for (const c of GOOGLE_ADS_CAMPAIGNS) {
  console.log(`▸ ${c.name}`);
  console.log(`  URL: ${c.finalUrl}`);
  console.log(`  Kelimeler: ${c.keywords.join(", ")}`);
  console.log(`  Başlıklar: ${c.headlines.slice(0, 4).join(" | ")}...`);
  console.log("");
}

console.log("Negatif kelimeler:", GOOGLE_ADS_NEGATIVE_KEYWORDS.join(", "));
console.log("\nSite bağlantıları:", GOOGLE_ADS_EXTENSIONS.sitelinks.map((s) => s.text).join(", "));

const outPath = resolve(process.cwd(), ".env.google-ads");
if (!existsSync(outPath)) {
  const template = `# myQR Google Ads — bu dosyayı doldurun, asla commit etmeyin
# GOOGLE_ADS_CUSTOMER_ID=123-456-7890
# GOOGLE_ADS_DAILY_BUDGET_TRY=150
# GOOGLE_ADS_BILLING_EMAIL=you@example.com
# GOOGLE_ADS_PHONE=+905051236824

NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_GOOGLE_ADS_ID=
NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_SEND_TO=
NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO=
`;
  writeFileSync(outPath, template);
  console.log(`\nŞablon oluşturuldu: ${outPath}`);
  console.log("Doldurduktan sonra: bash scripts/apply-google-ads-env.sh\n");
}
