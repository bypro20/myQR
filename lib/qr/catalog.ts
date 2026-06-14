import { buildTurkishIbanQr } from "@/lib/qr/iban-qr";
import { getAppUrl } from "@/lib/utils";

function appBase(baseUrl?: string) {
  return (baseUrl || getAppUrl()).replace(/\/$/, "");
}

export type QrFieldType =
  | "text"
  | "url"
  | "email"
  | "tel"
  | "textarea"
  | "number"
  | "select"
  | "checkbox"
  | "bank";

export type QrFieldDef = {
  key: string;
  label: string;
  type: QrFieldType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  colSpan?: 1 | 2;
  required?: boolean;
};

export type QrEncoding =
  | "url"
  | "text"
  | "wifi"
  | "vcard"
  | "mecard"
  | "email"
  | "phone"
  | "sms"
  | "whatsapp"
  | "telegram"
  | "geo"
  | "iban"
  | "crypto"
  | "event"
  | "bio"
  | "warranty"
  | "lcv";

export type QrCatalogEntry = {
  id: string;
  label: string;
  category: string;
  encoding: QrEncoding;
  fields: QrFieldDef[];
  placeholder?: string;
  /** Banka/kartvizit vb. — QR içine doğrudan veri yazılır, dinamik mod uygun değil */
  staticOnly?: boolean;
};

export const QR_CATEGORIES = [
  "Genel & Web",
  "Konum & Harita",
  "İletişim",
  "Wi-Fi & Ağ",
  "Sosyal Medya",
  "Mobil Uygulama",
  "Ödeme & Bankacılık",
  "E-Ticaret",
  "İşletme & Hizmet",
  "Etkinlik & Medya",
  "Özel Formlar",
] as const;

const URL_FIELD: QrFieldDef = {
  key: "url",
  label: "Bağlantı URL",
  type: "url",
  placeholder: "https://",
  colSpan: 2,
  required: true,
};

const USERNAME_FIELD: QrFieldDef = {
  key: "username",
  label: "Kullanıcı adı",
  type: "text",
  placeholder: "kullaniciadi",
  required: true,
};

function socialFields(platform: string, placeholder: string): QrFieldDef[] {
  return [
    { key: "username", label: "Kullanıcı adı", type: "text", placeholder, required: false },
    {
      key: "url",
      label: `${platform} profil linki`,
      type: "url",
      placeholder: `https://${placeholder}/...`,
      colSpan: 2,
      required: false,
    },
  ];
}

export const QR_CATALOG: QrCatalogEntry[] = [
  // Genel & Web
  { id: "URL", label: "Web Sitesi / URL", category: "Genel & Web", encoding: "url", fields: [URL_FIELD] },
  {
    id: "TEXT",
    label: "Düz Metin",
    category: "Genel & Web",
    encoding: "text",
    staticOnly: true,
    fields: [{ key: "text", label: "Metin içeriği", type: "textarea", colSpan: 2, required: true, placeholder: "QR taranınca görünecek metin" }],
  },
  {
    id: "PDF",
    label: "PDF / Dosya Linki",
    category: "Genel & Web",
    encoding: "url",
    fields: [
      URL_FIELD,
      { key: "fileName", label: "Dosya adı (opsiyonel)", type: "text", placeholder: "katalog.pdf" },
    ],
  },

  // Konum
  { id: "GOOGLE_MAPS", label: "Google Maps / Konum", category: "Konum & Harita", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://maps.google.com/..." }] },
  { id: "GOOGLE_REVIEW", label: "Google Yorum / Değerlendirme", category: "Konum & Harita", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://g.page/r/..." }] },
  {
    id: "GEO",
    label: "GPS Koordinat",
    category: "Konum & Harita",
    encoding: "geo",
    staticOnly: true,
    fields: [
      { key: "latitude", label: "Enlem", type: "text", placeholder: "41.0082", required: true },
      { key: "longitude", label: "Boylam", type: "text", placeholder: "28.9784", required: true },
      { key: "label", label: "Konum adı (opsiyonel)", type: "text", placeholder: "Mağaza merkez" },
    ],
  },

  // İletişim
  { id: "PHONE", label: "Telefon Araması", category: "İletişim", encoding: "phone", fields: [{ key: "phone", label: "Telefon", type: "tel", colSpan: 2, required: true, placeholder: "+905551234567" }] },
  {
    id: "SMS",
    label: "SMS Mesajı",
    category: "İletişim",
    encoding: "sms",
    fields: [
      { key: "phone", label: "Telefon", type: "tel", required: true },
      { key: "message", label: "Hazır mesaj", type: "textarea", colSpan: 2 },
    ],
  },
  {
    id: "EMAIL",
    label: "E-posta",
    category: "İletişim",
    encoding: "email",
    fields: [
      { key: "email", label: "E-posta", type: "email", colSpan: 2, required: true },
      { key: "subject", label: "Konu", type: "text" },
      { key: "body", label: "Mesaj", type: "textarea", colSpan: 2 },
    ],
  },
  {
    id: "WHATSAPP",
    label: "WhatsApp",
    category: "İletişim",
    encoding: "whatsapp",
    fields: [
      { key: "countryCode", label: "Ülke kodu", type: "text", placeholder: "90" },
      { key: "phone", label: "Telefon", type: "tel", required: true },
      { key: "message", label: "Hazır mesaj", type: "textarea", colSpan: 2 },
    ],
  },
  {
    id: "TELEGRAM",
    label: "Telegram",
    category: "İletişim",
    encoding: "telegram",
    fields: [
      USERNAME_FIELD,
      { key: "url", label: "veya Telegram linki", type: "url", colSpan: 2, placeholder: "https://t.me/kanal" },
    ],
  },
  {
    id: "VCARD",
    label: "vCard / Kartvizit",
    category: "İletişim",
    encoding: "vcard",
    staticOnly: true,
    fields: [
      { key: "fullName", label: "Ad Soyad", type: "text", required: true },
      { key: "company", label: "Firma", type: "text" },
      { key: "title", label: "Unvan", type: "text" },
      { key: "phone", label: "Telefon", type: "tel" },
      { key: "email", label: "E-posta", type: "email" },
      { key: "website", label: "Web sitesi", type: "url", colSpan: 2 },
      { key: "address", label: "Adres", type: "text", colSpan: 2 },
      { key: "note", label: "Not", type: "textarea", colSpan: 2 },
    ],
  },
  {
    id: "ME_CARD",
    label: "MECARD (Mobil kartvizit)",
    category: "İletişim",
    encoding: "mecard",
    staticOnly: true,
    fields: [
      { key: "fullName", label: "Ad Soyad", type: "text", required: true },
      { key: "phone", label: "Telefon", type: "tel" },
      { key: "email", label: "E-posta", type: "email" },
      { key: "company", label: "Firma", type: "text" },
    ],
  },

  // Wi-Fi
  {
    id: "WIFI",
    label: "Wi-Fi Bağlantısı",
    category: "Wi-Fi & Ağ",
    encoding: "wifi",
    staticOnly: true,
    fields: [
      { key: "ssid", label: "Ağ adı (SSID)", type: "text", required: true },
      { key: "password", label: "Şifre", type: "text" },
      {
        key: "encryption",
        label: "Şifreleme",
        type: "select",
        options: [
          { value: "WPA", label: "WPA/WPA2" },
          { value: "WEP", label: "WEP" },
          { value: "nopass", label: "Şifresiz" },
        ],
      },
      { key: "hidden", label: "Gizli ağ", type: "checkbox" },
    ],
  },

  // Sosyal Medya
  { id: "SOCIAL", label: "Sosyal Medya (Genel)", category: "Sosyal Medya", encoding: "url", fields: [
    { key: "platform", label: "Platform", type: "select", options: ["Instagram", "TikTok", "Facebook", "YouTube", "LinkedIn", "X / Twitter", "Diğer"].map((p) => ({ value: p, label: p })) },
    { key: "url", label: "Profil linki", type: "url", colSpan: 2, required: true },
  ]},
  { id: "INSTAGRAM", label: "Instagram", category: "Sosyal Medya", encoding: "url", fields: socialFields("Instagram", "instagram.com") },
  { id: "FACEBOOK", label: "Facebook", category: "Sosyal Medya", encoding: "url", fields: socialFields("Facebook", "facebook.com") },
  { id: "YOUTUBE", label: "YouTube", category: "Sosyal Medya", encoding: "url", fields: socialFields("YouTube", "youtube.com") },
  { id: "TIKTOK", label: "TikTok", category: "Sosyal Medya", encoding: "url", fields: socialFields("TikTok", "tiktok.com") },
  { id: "LINKEDIN", label: "LinkedIn", category: "Sosyal Medya", encoding: "url", fields: socialFields("LinkedIn", "linkedin.com") },
  { id: "TWITTER", label: "X (Twitter)", category: "Sosyal Medya", encoding: "url", fields: socialFields("X", "x.com") },
  { id: "SNAPCHAT", label: "Snapchat", category: "Sosyal Medya", encoding: "url", fields: socialFields("Snapchat", "snapchat.com") },
  { id: "SPOTIFY", label: "Spotify", category: "Sosyal Medya", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://open.spotify.com/..." }] },
  { id: "DISCORD", label: "Discord Davet", category: "Sosyal Medya", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://discord.gg/..." }] },

  // Mobil Uygulama
  { id: "APP_STORE", label: "Apple App Store", category: "Mobil Uygulama", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://apps.apple.com/app/id..." }] },
  { id: "PLAY_STORE", label: "Google Play Store", category: "Mobil Uygulama", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://play.google.com/store/apps/..." }] },

  // Ödeme & Bankacılık
  {
    id: "IBAN",
    label: "IBAN / FAST Havale (TR Karekod)",
    category: "Ödeme & Bankacılık",
    encoding: "iban",
    staticOnly: true,
    fields: [
      { key: "iban", label: "IBAN", type: "text", colSpan: 2, required: true, placeholder: "TR00 0000 0000 0000 0000 0000 00" },
      { key: "bankCode", label: "IBAN'ın kayıtlı olduğu banka (otomatik)", type: "bank", colSpan: 2, required: false },
      { key: "receiverName", label: "Alıcı adı", type: "text", colSpan: 2, required: true },
      {
        key: "paymentScene",
        label: "Karekod formatı",
        type: "select",
        colSpan: 2,
        options: [
          { value: "p2p", label: "Kişiden kişiye — Enpara: Para Gönder → Karekod ile Öde (önerilen)" },
          { value: "merchant", label: "İşyeri levhası — banka uygulamasında TR Karekod ile Öde" },
        ],
      },
      { key: "amount", label: "Tutar (₺, opsiyonel)", type: "text", placeholder: "150.00" },
      { key: "description", label: "Açıklama", type: "text", colSpan: 2 },
    ],
  },
  {
    id: "CRYPTO",
    label: "Kripto Cüzdan",
    category: "Ödeme & Bankacılık",
    encoding: "crypto",
    staticOnly: true,
    fields: [
      { key: "currency", label: "Para birimi", type: "select", options: [
        { value: "bitcoin", label: "Bitcoin (BTC)" },
        { value: "ethereum", label: "Ethereum (ETH)" },
        { value: "usdt", label: "USDT (TRC20)" },
      ]},
      { key: "address", label: "Cüzdan adresi", type: "text", colSpan: 2, required: true },
      { key: "amount", label: "Tutar (opsiyonel)", type: "text" },
    ],
  },
  { id: "PAYPAL", label: "PayPal", category: "Ödeme & Bankacılık", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://paypal.me/kullanici" }] },
  { id: "PAYMENT_LINK", label: "Ödeme Linki (iyzico, PayTR vb.)", category: "Ödeme & Bankacılık", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://odeme.siteniz.com/..." }] },

  // E-Ticaret
  { id: "ECOMMERCE", label: "E-Ticaret Mağazası", category: "E-Ticaret", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://magaza.com" }] },
  { id: "PRODUCT", label: "Ürün Sayfası", category: "E-Ticaret", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://magaza.com/urun/..." }] },
  { id: "COUPON", label: "Kupon / İndirim Kodu", category: "E-Ticaret", encoding: "url", fields: [
    { key: "url", label: "Kampanya linki", type: "url", colSpan: 2, required: true },
    { key: "code", label: "Kupon kodu (opsiyonel)", type: "text", placeholder: "INDIRIM20" },
  ]},
  { id: "MENU", label: "QR Menü (Restoran/Kafe)", category: "E-Ticaret", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://menu.restoran.com" }] },
  { id: "BOOKING", label: "Randevu / Rezervasyon", category: "E-Ticaret", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://calendly.com/..." }] },

  // İşletme
  { id: "FEEDBACK", label: "Müşteri Geri Bildirim Formu", category: "İşletme & Hizmet", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://forms.google.com/..." }] },
  { id: "CATALOG", label: "Ürün Kataloğu", category: "İşletme & Hizmet", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://katalog.sirket.com" }] },
  { id: "MEMBERSHIP", label: "Sadakat / Üyelik Programı", category: "İşletme & Hizmet", encoding: "url", fields: [{ ...URL_FIELD }] },
  { id: "PARKING", label: "Otopark Ödeme / Bilgi", category: "İşletme & Hizmet", encoding: "url", fields: [{ ...URL_FIELD }] },
  { id: "DONATION", label: "Bağış / Yardım", category: "İşletme & Hizmet", encoding: "url", fields: [{ ...URL_FIELD }] },
  { id: "TABLE_ORDER", label: "Masadan Sipariş", category: "İşletme & Hizmet", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://siparis.restoran.com/masa-5" }] },
  { id: "INVENTORY", label: "Stok / Envanter Takibi", category: "İşletme & Hizmet", encoding: "url", fields: [{ ...URL_FIELD }] },

  // Etkinlik & Medya
  {
    id: "EVENT",
    label: "Takvim Etkinliği",
    category: "Etkinlik & Medya",
    encoding: "event",
    staticOnly: true,
    fields: [
      { key: "title", label: "Etkinlik adı", type: "text", required: true, colSpan: 2 },
      { key: "startDate", label: "Başlangıç", type: "text", placeholder: "20260615T180000", required: true },
      { key: "endDate", label: "Bitiş", type: "text", placeholder: "20260615T220000" },
      { key: "location", label: "Konum", type: "text", colSpan: 2 },
      { key: "description", label: "Açıklama", type: "textarea", colSpan: 2 },
    ],
  },
  { id: "VIDEO", label: "Video (YouTube/Vimeo)", category: "Etkinlik & Medya", encoding: "url", fields: [{ ...URL_FIELD, placeholder: "https://youtube.com/watch?v=..." }] },

  // Özel Formlar
  { id: "LINK_BIO", label: "Link Bio Sayfası", category: "Özel Formlar", encoding: "bio", fields: [] },
  { id: "WARRANTY", label: "Garanti Aktivasyon Formu", category: "Özel Formlar", encoding: "warranty", fields: [] },
  {
    id: "LCV",
    label: "LCV / Davetiye Katılım",
    category: "Özel Formlar",
    encoding: "lcv",
    fields: [{ key: "eventDate", label: "Etkinlik tarihi", type: "text", colSpan: 2, placeholder: "12 Haziran 2026" }],
  },
];

export const QR_TYPE_COUNT = QR_CATALOG.length;

export const QR_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  QR_CATALOG.map((e) => [e.id, e.label]),
);

export const QR_TYPE_IDS = QR_CATALOG.map((e) => e.id);

export const URL_QR_TYPES = new Set(
  QR_CATALOG.filter((e) => e.encoding === "url").map((e) => e.id),
);

export function getCatalogEntry(type: string): QrCatalogEntry | undefined {
  return QR_CATALOG.find((e) => e.id === type);
}

function escapeVcard(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

function resolveSocialUrl(type: string, payload: Record<string, unknown>, targetUrl?: string | null) {
  const direct = String(payload.url || targetUrl || "").trim();
  if (direct) return direct;

  const username = String(payload.username || "").trim().replace(/^@/, "");
  if (!username) return "";

  const bases: Record<string, string> = {
    INSTAGRAM: `https://instagram.com/${username}`,
    FACEBOOK: `https://facebook.com/${username}`,
    YOUTUBE: `https://youtube.com/@${username}`,
    TIKTOK: `https://tiktok.com/@${username}`,
    LINKEDIN: `https://linkedin.com/in/${username}`,
    TWITTER: `https://x.com/${username}`,
    SNAPCHAT: `https://snapchat.com/add/${username}`,
  };
  return bases[type] || "";
}

export function buildCatalogDirectContent(input: {
  type: string;
  shortCode?: string | null;
  targetUrl?: string | null;
  payload: Record<string, unknown>;
  baseUrl?: string;
}) {
  const { type, shortCode, targetUrl, payload, baseUrl } = input;
  const entry = getCatalogEntry(type);

  if (URL_QR_TYPES.has(type)) {
    if (type === "SOCIAL") return String(payload.url || targetUrl || "");
    return resolveSocialUrl(type, payload, targetUrl) || String(payload.url || targetUrl || "");
  }

  switch (entry?.encoding ?? type) {
    case "text":
      return String(payload.text || "").trim();
    case "wifi": {
      const ssid = String(payload.ssid || "");
      if (!ssid) return "";
      const hidden = payload.hidden ? "H:true;" : "";
      const enc = payload.encryption === "nopass" ? "nopass" : String(payload.encryption || "WPA");
      return `WIFI:T:${enc};S:${ssid};P:${String(payload.password || "")};${hidden};`;
    }
    case "whatsapp": {
      const phone = `${payload.countryCode || ""}${payload.phone || ""}`.replace(/\D/g, "");
      if (!phone) return "";
      const text = encodeURIComponent(String(payload.message || ""));
      return text ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/${phone}`;
    }
    case "telegram": {
      const url = String(payload.url || "").trim();
      if (url) return url;
      const user = String(payload.username || "").replace(/^@/, "");
      return user ? `https://t.me/${user}` : "";
    }
    case "phone":
      return payload.phone ? `tel:${String(payload.phone).replace(/\s/g, "")}` : "";
    case "sms": {
      if (!payload.phone) return "";
      const phone = String(payload.phone).replace(/\s/g, "");
      const message = String(payload.message || "");
      return message ? `sms:${phone}?body=${encodeURIComponent(message)}` : `sms:${phone}`;
    }
    case "email": {
      const email = String(payload.email || "").trim();
      if (!email) return "";
      const params = new URLSearchParams();
      if (payload.subject) params.set("subject", String(payload.subject));
      if (payload.body) params.set("body", String(payload.body));
      const qs = params.toString();
      return qs ? `mailto:${email}?${qs}` : `mailto:${email}`;
    }
    case "geo": {
      const lat = String(payload.latitude || "").trim();
      const lng = String(payload.longitude || "").trim();
      if (!lat || !lng) return "";
      const label = String(payload.label || "").trim();
      return label ? `geo:${lat},${lng}?q=${encodeURIComponent(label)}` : `geo:${lat},${lng}`;
    }
    case "iban":
      return buildTurkishIbanQr({
        iban: String(payload.iban || ""),
        receiverName: String(payload.receiverName || ""),
        amount: String(payload.amount || ""),
        description: String(payload.description || ""),
        bankCode: String(payload.bankCode || ""),
        scene: (payload.paymentScene === "p2p" ? "p2p" : "merchant") as "merchant" | "p2p",
      });
    case "crypto": {
      const address = String(payload.address || "").trim();
      if (!address) return "";
      const currency = String(payload.currency || "bitcoin");
      const amount = String(payload.amount || "").trim();
      const scheme = currency === "ethereum" ? "ethereum" : currency === "usdt" ? "tron" : "bitcoin";
      return amount ? `${scheme}:${address}?amount=${amount}` : `${scheme}:${address}`;
    }
    case "event": {
      const title = String(payload.title || "").trim();
      const start = String(payload.startDate || "").trim();
      if (!title || !start) return "";
      const lines = [
        "BEGIN:VEVENT",
        `SUMMARY:${escapeVcard(title)}`,
        `DTSTART:${start}`,
        payload.endDate ? `DTEND:${String(payload.endDate)}` : "",
        payload.location ? `LOCATION:${escapeVcard(String(payload.location))}` : "",
        payload.description ? `DESCRIPTION:${escapeVcard(String(payload.description))}` : "",
        "END:VEVENT",
      ].filter(Boolean);
      return lines.join("\n");
    }
    case "vcard": {
      const fullName = String(payload.fullName || "").trim();
      if (!fullName) return "";
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${escapeVcard(fullName)}`,
        payload.company ? `ORG:${escapeVcard(String(payload.company))}` : "",
        payload.title ? `TITLE:${escapeVcard(String(payload.title))}` : "",
        payload.phone ? `TEL;TYPE=CELL:${payload.phone}` : "",
        payload.email ? `EMAIL:${payload.email}` : "",
        payload.website ? `URL:${payload.website}` : "",
        payload.address ? `ADR:;;${escapeVcard(String(payload.address))};;;;` : "",
        payload.note ? `NOTE:${escapeVcard(String(payload.note))}` : "",
        "END:VCARD",
      ].filter(Boolean).join("\n");
    }
    case "mecard": {
      const fullName = String(payload.fullName || "").trim();
      if (!fullName) return "";
      const parts = [`N:${escapeVcard(fullName)}`];
      if (payload.phone) parts.push(`TEL:${payload.phone}`);
      if (payload.email) parts.push(`EMAIL:${payload.email}`);
      if (payload.company) parts.push(`ORG:${payload.company}`);
      return `MECARD:${parts.join(";")};;`;
    }
    case "bio":
      return `${appBase(baseUrl)}/bio/${payload.slug || shortCode || ""}`;
    case "warranty":
      return `${appBase(baseUrl)}/garanti/${payload.slug || shortCode || ""}`;
    case "lcv":
      return `${appBase(baseUrl)}/lcv/${payload.slug || shortCode || ""}`;
    default:
      return String(targetUrl || "");
  }
}

function isHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateCatalogInput(type: string, payload: Record<string, unknown>, targetUrl?: string) {
  const errors: string[] = [];
  const entry = getCatalogEntry(type);
  if (!entry) return errors;

  if (type === "LINK_BIO") return errors;

  for (const field of entry.fields) {
    if (!field.required) continue;
    if (URL_QR_TYPES.has(type) && field.key === "url") continue;
    const val = payload[field.key];
    if (field.type === "checkbox") continue;
    if (!String(val ?? "").trim()) {
      errors.push(`${field.label} girilmediği için QR üretilemiyor.`);
    }
  }

  if (URL_QR_TYPES.has(type)) {
    const url = resolveSocialUrl(type, payload, targetUrl) || String(payload.url || targetUrl || "").trim();
    if (!url) errors.push("Bağlantı URL'si girilmediği için QR üretilemiyor.");
    else if (!isHttpUrl(url)) errors.push("Geçerli bir http:// veya https:// bağlantısı girin.");
  }

  if (type === "EMAIL" && payload.email && !isEmail(String(payload.email))) {
    errors.push("Geçerli bir e-posta adresi girin.");
  }

  if (type === "IBAN") {
    const iban = String(payload.iban || "").replace(/\s/g, "").toUpperCase();
    if (iban && !iban.startsWith("TR")) errors.push("IBAN TR ile başlamalıdır.");
    if (iban && iban.length !== 26) errors.push("Geçerli bir Türkiye IBAN numarası girin (26 karakter).");
  }

  if (type === "WHATSAPP") {
    const phone = `${payload.countryCode || ""}${payload.phone || ""}`.replace(/\D/g, "");
    if (phone && phone.length < 8) errors.push("Telefon numarası en az 8 haneli olmalıdır.");
  }

  if ((type === "PHONE" || type === "SMS") && payload.phone) {
    if (String(payload.phone).replace(/\D/g, "").length < 8) {
      errors.push("Geçerli telefon numarası girin.");
    }
  }

  if (type === "VCARD" && !String(payload.fullName || "").trim()) {
    errors.push("Ad soyad girilmediği için kartvizit QR üretilemiyor.");
  }

  if (type === "WIFI") {
    const enc = String(payload.encryption || "WPA");
    if (enc !== "nopass" && !String(payload.password || "").trim()) {
      errors.push("Wi-Fi şifresi girilmediği için QR üretilemiyor.");
    }
    const ssid = String(payload.ssid || "");
    if (ssid && /[<>"']/.test(ssid)) {
      errors.push("Wi-Fi ağ adında geçersiz karakter var.");
    }
  }

  return errors;
}

export function isStaticOnlyType(type: string) {
  return Boolean(getCatalogEntry(type)?.staticOnly);
}

export function getDefaultPayload(type: string): Record<string, unknown> {
  const entry = getCatalogEntry(type);
  if (!entry) return { url: "" };
  const payload: Record<string, unknown> = {};
  for (const field of entry.fields) {
    if (field.key === "countryCode") payload[field.key] = "90";
    else if (field.key === "encryption") payload[field.key] = "WPA";
    else if (field.key === "platform") payload[field.key] = "Instagram";
    else if (field.key === "currency") payload[field.key] = "bitcoin";
    else if (field.key === "paymentScene") payload[field.key] = "p2p";
    else if (field.key === "bankCode") payload[field.key] = "";
    else if (field.type === "checkbox") payload[field.key] = false;
    else payload[field.key] = "";
  }
  if (URL_QR_TYPES.has(type) && !("url" in payload)) payload.url = "";
  return payload;
}

/** Test ve doğrulama için geçerli örnek payload */
export function getSamplePayload(type: string): Record<string, unknown> {
  const sampleUrl = "https://example.com";
  switch (type) {
    case "TEXT":
      return { text: "Örnek QR metni" };
    case "GEO":
      return { latitude: "41.0082", longitude: "28.9784", label: "Istanbul" };
    case "PHONE":
      return { phone: "+905551112233" };
    case "SMS":
      return { phone: "+905551112233", message: "Merhaba" };
    case "EMAIL":
      return { email: "ornek@example.com", subject: "Konu", body: "Mesaj" };
    case "WHATSAPP":
      return { countryCode: "90", phone: "5551112233", message: "Merhaba" };
    case "TELEGRAM":
      return { username: "ornek_kanal" };
    case "VCARD":
    case "ME_CARD":
      return { fullName: "Ornek Kisi", phone: "+905551112233", email: "ornek@example.com" };
    case "WIFI":
      return { ssid: "OrnekWiFi", password: "sifre123", encryption: "WPA" };
    case "IBAN":
      return {
        iban: "TR290006701000000097199493",
        receiverName: "Ornek Kisi",
        paymentScene: "p2p",
        amount: "100",
      };
    case "CRYPTO":
      return { currency: "bitcoin", address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" };
    case "EVENT":
      return { title: "Ornek Etkinlik", startDate: "20260615T180000", endDate: "20260615T220000" };
    case "LINK_BIO":
      return {
        slug: "ornek-bio",
        links: [{ label: "Web", url: sampleUrl }],
        bgColor: "#ffffff",
        buttonColor: "#111827",
      };
    case "WARRANTY":
      return { slug: "ornek-garanti" };
    case "LCV":
      return { slug: "ornek-lcv", eventDate: "15 Haziran 2026" };
    case "COUPON":
      return { url: `${sampleUrl}/kampanya`, code: "INDIRIM20" };
    default:
      return { ...getDefaultPayload(type), url: sampleUrl };
  }
}

export function catalogTypesByCategory() {
  return QR_CATEGORIES.map((category) => ({
    category,
    types: QR_CATALOG.filter((e) => e.category === category),
  })).filter((g) => g.types.length > 0);
}
