/**
 * Google Ads kampanya paketi — myqar.net
 * Env doldurulunca deploy + ads.google.com'a kopyala-yapıştır için tek kaynak.
 */
import { totalSignupCredits } from "@/lib/marketing/launch-config";
import { PRICING } from "@/lib/billing/pricing-config";

export type GoogleAdsIntake = {
  /** XXX-XXX-XXXX */
  customerId: string;
  /** AW-XXXXXXXXXX */
  conversionId: string;
  /** Kayıt: AW-xxx/label */
  signupSendTo: string;
  /** Ödeme: AW-xxx/label (opsiyonel) */
  purchaseSendTo?: string;
  /** G-XXXXXXXXXX (opsiyonel) */
  ga4Id?: string;
  /** Günlük toplam bütçe TRY */
  dailyBudgetTry: number;
  /** Reklamda görünen telefon */
  phoneE164: string;
  /** Fatura / iletişim e-postası */
  billingEmail: string;
};

export const GOOGLE_ADS_INTake_FIELDS = [
  { key: "customerId", label: "Google Ads Müşteri ID", example: "123-456-7890", required: true },
  { key: "conversionId", label: "Dönüşüm / Etiket ID (AW-...)", example: "AW-1234567890", required: true },
  { key: "signupSendTo", label: "Kayıt dönüşüm send_to", example: "AW-1234567890/AbCdEfGh", required: true },
  { key: "purchaseSendTo", label: "Ödeme dönüşüm send_to", example: "AW-1234567890/XyZ12345", required: false },
  { key: "ga4Id", label: "Google Analytics 4 ID", example: "G-XXXXXXXXXX", required: false },
  { key: "dailyBudgetTry", label: "Günlük bütçe (₺)", example: "150", required: true },
  { key: "phoneE164", label: "Telefon (reklam)", example: "+905051236824", required: true },
  { key: "billingEmail", label: "Google Ads hesap e-postası", example: "siz@email.com", required: true },
] as const;

/** ASLA istenmez: Google şifresi, kart numarası, 2FA kodu */
export const GOOGLE_ADS_NEVER_SHARE = [
  "Google hesap şifresi",
  "Kredi/banka kartı numarası",
  "Tek kullanımlık 2FA kodu",
  "Tam kimlik / TC (gerekmez)",
];

const credits = totalSignupCredits();

export const GOOGLE_ADS_CAMPAIGNS = [
  {
    id: "brand",
    name: "myQR | Marka",
    dailyBudgetPercent: 15,
    finalUrl: "https://myqar.net/signup",
    keywords: ["myqr", "my qr", "myqar", "myqar.net", "myqr qr kod"],
    matchType: "exact",
    headlines: [
      "myQR Resmi Site",
      "Profesyonel QR Platformu",
      "14 Gün Pro Denemesi",
      `${credits} Hoş Geldin Kredisi`,
      "Hemen Ücretsiz Başla",
    ],
    descriptions: [
      `Dinamik QR ve analitik — ${PRICING.trialDays} gün Pro denemesi, kredi kartı gerekmez.`,
      "Matbaa, ajans ve perakende için QR kod paneli. myqar.net",
    ],
  },
  {
    id: "generic",
    name: "myQR | QR Genel",
    dailyBudgetPercent: 45,
    finalUrl: "https://myqar.net/signup",
    keywords: [
      "qr kod oluştur",
      "qr kod generator",
      "dinamik qr kod",
      "qr kod yapma",
      "online qr kod",
      "qr kod paneli",
      "ücretsiz qr kod oluştur",
    ],
    matchType: "phrase",
    headlines: [
      "Profesyonel QR Platformu",
      "14 Gün Pro Denemesi",
      `${credits} Hoş Geldin Kredisi`,
      "Dinamik QR Kod Oluştur",
      "45+ QR Formatı Hazır",
      "Kredi Kartı Gerekmez",
      "Canlı Tarama Analitiği",
      "Toplu QR CSV/ZIP",
      "Hemen Ücretsiz Başla",
    ],
    descriptions: [
      "Dinamik QR, toplu üretim ve analitik — tek panelde. 14 gün Pro denemesi.",
      `${credits} kredi ile ilk QR kodunuzu dakikalar içinde oluşturun. myqar.net`,
      "15 gün QR denemesi, haftalık/aylık/kalıcı süre paketleri. Matbaa & ajans için.",
      "45+ format: menü, Wi-Fi, vCard, IBAN. Türkçe panel ve destek.",
    ],
  },
  {
    id: "print",
    name: "myQR | Matbaa & Ajans",
    dailyBudgetPercent: 25,
    finalUrl: "https://myqar.net/qr-kod-matbaa",
    keywords: [
      "matbaa qr kod",
      "toplu qr kod",
      "toplu qr kod oluşturma",
      "qr kod matbaa",
      "csv qr kod",
      "dinamik qr matbaa",
    ],
    matchType: "phrase",
    headlines: [
      "Matbaa QR Kod Çözümü",
      "Toplu QR CSV → ZIP",
      "Kalıcı QR Lisansı",
      "Panel Kiralama Bayi",
      "Dinamik QR Matbaa",
      "14 Gün Ücretsiz Deneme",
    ],
    descriptions: [
      "Matbaa için toplu QR, kalıcı lisans ve müşteri paneli. CSV ile yüzlerce kod.",
      "Baskı sabit — link panelden güncellenir. Ajans ve matbaa için profesyonel altyapı.",
      "Panel kiralama ile müşteri başına hesap. Kendi fiyatınızla QR hizmeti satın.",
    ],
  },
  {
    id: "restaurant",
    name: "myQR | Restoran Menü",
    dailyBudgetPercent: 15,
    finalUrl: "https://myqar.net/restoran-menu-qr",
    keywords: [
      "restoran menü qr",
      "qr menü oluştur",
      "dijital menü qr",
      "kafe qr menü",
      "qr kod menü",
    ],
    matchType: "phrase",
    headlines: [
      "Restoran Menü QR Kodu",
      "Dijital Menü Anında",
      "Fiyat Değişince QR Aynı",
      "15 Gün Ücretsiz Deneme",
      "Tarama Analitiği",
    ],
    descriptions: [
      "Menü QR — fiyat güncellemesinde yeni baskı gerekmez. Dinamik yönlendirme.",
      "Restoran ve kafe için dijital menü QR. Yoğun saatleri analitikten izleyin.",
      "14 gün Pro denemesi, kredi kartı gerekmez. Hemen menü QR oluşturun.",
    ],
  },
] as const;

export const GOOGLE_ADS_NEGATIVE_KEYWORDS = [
  "ücretsiz indir",
  "apk",
  "crack",
  "wikipedia",
  "iş ilanı",
  "kurs",
  "pdf indir",
  "whatsapp qr okuma",
  "nasıl yapılır el ile",
  "generator ücretsiz sınırsız",
];

export const GOOGLE_ADS_EXTENSIONS = {
  sitelinks: [
    { text: "Ücretsiz Kayıt", url: "https://myqar.net/signup" },
    { text: "Fiyatlandırma", url: "https://myqar.net/pricing" },
    { text: "Dinamik QR", url: "https://myqar.net/dinamik-qr-kod" },
    { text: "Panel Kiralama", url: "https://myqar.net/panel-kiralama" },
  ],
  callouts: [
    "14 gün Pro denemesi",
    "Kredi kartı gerekmez",
    "45+ QR formatı",
    "Toplu CSV/ZIP",
    "Canlı analitik",
    "Türkçe destek",
  ],
  structuredSnippet: {
    header: "Hizmetler",
    values: ["Dinamik QR", "Toplu üretim", "Menü QR", "Garanti formu", "LCV", "Analitik"],
  },
};

export function dailyBudgetSplit(totalTry: number) {
  return GOOGLE_ADS_CAMPAIGNS.map((c) => ({
    campaign: c.name,
    dailyTry: Math.round((totalTry * c.dailyBudgetPercent) / 100),
  }));
}

export function intakeToEnv(intake: Partial<GoogleAdsIntake>): Record<string, string> {
  const env: Record<string, string> = {};
  if (intake.ga4Id) env.NEXT_PUBLIC_GA4_ID = intake.ga4Id;
  if (intake.conversionId) env.NEXT_PUBLIC_GOOGLE_ADS_ID = intake.conversionId;
  if (intake.signupSendTo) env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_SEND_TO = intake.signupSendTo;
  if (intake.purchaseSendTo) env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_SEND_TO = intake.purchaseSendTo;
  return env;
}
