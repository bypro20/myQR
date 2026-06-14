export type QrDesign = {
  foregroundColor: string;
  backgroundColor: string;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  margin: number;
  size: number;
  dotStyle: "square" | "rounded" | "dots";
  cornerStyle: "square" | "rounded" | "extra-rounded";
  logoUrl?: string;
  logoSize: number;
  logoMargin: number;
  title?: string;
  caption?: string;
  frameEnabled?: boolean;
  frameStyle?: "classic" | "modern" | "premium" | "minimal" | "none";
  frameColor?: string;
  showScanLabel?: boolean;
  /** QR matrisinin etrafındaki ince profesyonel çerçeve */
  qrBorderEnabled?: boolean;
  qrBorderWidth?: number;
};

export type BioLink = {
  label: string;
  url: string;
  type?: string;
};

export type UrlPayload = { url: string };
export type MapsPayload = { url: string };
export type ReviewPayload = { url: string };
export type WifiPayload = {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
};
export type WhatsappPayload = {
  countryCode: string;
  phone: string;
  message: string;
};
export type SocialPayload = { platform: string; url: string };
export type VcardPayload = {
  fullName: string;
  company?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  note?: string;
  socialLinks?: string[];
};
export type EmailPayload = { email: string; subject?: string; body?: string };
export type PhonePayload = { phone: string };
export type SmsPayload = { phone: string; message?: string };
export type PdfPayload = { url: string; fileName?: string };

export const DEFAULT_DESIGN: QrDesign = {
  foregroundColor: "#111827",
  backgroundColor: "#ffffff",
  errorCorrectionLevel: "H",
  margin: 4,
  size: 512,
  dotStyle: "square",
  cornerStyle: "square",
  logoSize: 0.22,
  logoMargin: 8,
  frameEnabled: true,
  frameStyle: "minimal",
  frameColor: "#111827",
  showScanLabel: true,
  qrBorderEnabled: true,
  qrBorderWidth: 1.5,
};

export const FRAME_STYLE_LABELS: Record<NonNullable<QrDesign["frameStyle"]>, string> = {
  classic: "Klasik çift çerçeve",
  modern: "Modern kalın çerçeve",
  premium: "Premium gradyan",
  minimal: "Minimal ince çerçeve",
  none: "Çerçevesiz",
};

export { QR_TYPE_LABELS, QR_CATEGORIES, QR_CATALOG, QR_TYPE_COUNT, catalogTypesByCategory, getDefaultPayload, isStaticOnlyType } from "@/lib/qr/catalog";

export const TEMPLATE_PRESETS = [
  { name: "Pleksi QR Menü Standı", qrType: "MENU", dimensions: "A5", printFormat: "PNG" },
  { name: "Metal QR Menü Levhası", qrType: "MENU", dimensions: "20x30cm", printFormat: "PDF" },
  { name: "Restoran QR Menü Baskısı", qrType: "MENU", dimensions: "A4", printFormat: "PDF" },
  { name: "Kafe QR Menü Standı", qrType: "MENU", dimensions: "10x15cm", printFormat: "PNG" },
  { name: "Google Yorum QR Standı", qrType: "GOOGLE_REVIEW", dimensions: "10x10cm", printFormat: "PNG" },
  { name: "Wi-Fi QR Kod Etiketi", qrType: "WIFI", dimensions: "5x5cm", printFormat: "PNG" },
  { name: "QR Yol Tarifi Kartı", qrType: "GOOGLE_MAPS", dimensions: "9x5cm", printFormat: "PDF" },
  { name: "IBAN / FAST Havale QR", qrType: "IBAN", dimensions: "9x5cm", printFormat: "PNG" },
  { name: "Otel Odası QR Kartı", qrType: "URL", dimensions: "9x5cm", printFormat: "PDF" },
  { name: "Oda Servisi QR Kartı", qrType: "TABLE_ORDER", dimensions: "9x5cm", printFormat: "PDF" },
  { name: "QR Check-in Bilgilendirme Kartı", qrType: "URL", dimensions: "A6", printFormat: "PDF" },
  { name: "Ürün Ambalajı QR Etiketi", qrType: "PRODUCT", dimensions: "3x3cm", printFormat: "PNG" },
  { name: "QR Ürün Bilgi Etiketi", qrType: "PDF", dimensions: "4x4cm", printFormat: "PNG" },
  { name: "QR Garanti Aktivasyon Etiketi", qrType: "WARRANTY", dimensions: "5x5cm", printFormat: "PNG" },
  { name: "Kampanya QR Etiketi", qrType: "COUPON", dimensions: "5x5cm", printFormat: "PNG" },
  { name: "Instagram QR Takip Kartı", qrType: "INSTAGRAM", dimensions: "9x5cm", printFormat: "PDF" },
  { name: "TikTok QR Takip Kartı", qrType: "TIKTOK", dimensions: "9x5cm", printFormat: "PDF" },
  { name: "QR Kodlu Kartvizit", qrType: "VCARD", dimensions: "9x5cm", printFormat: "PDF" },
  { name: "App Store İndirme QR", qrType: "APP_STORE", dimensions: "9x5cm", printFormat: "PNG" },
  { name: "Google Play İndirme QR", qrType: "PLAY_STORE", dimensions: "9x5cm", printFormat: "PNG" },
  { name: "QR Kodlu Düğün Davetiyesi", qrType: "LCV", dimensions: "A6", printFormat: "PDF" },
  { name: "QR Kodlu Nişan Davetiyesi", qrType: "LCV", dimensions: "A6", printFormat: "PDF" },
  { name: "QR Kodlu Kına Gecesi Davetiyesi", qrType: "LCV", dimensions: "A6", printFormat: "PDF" },
  { name: "QR Kodlu Nikah Davetiyesi", qrType: "LCV", dimensions: "A6", printFormat: "PDF" },
  { name: "QR Kodlu Sünnet Davetiyesi", qrType: "LCV", dimensions: "A6", printFormat: "PDF" },
  { name: "Google Maps QR Davetiye", qrType: "GOOGLE_MAPS", dimensions: "A6", printFormat: "PDF" },
  { name: "QR Kodlu Magnet Davetiye", qrType: "LCV", dimensions: "7x7cm", printFormat: "PNG" },
  { name: "Ödeme Linki QR (iyzico)", qrType: "PAYMENT_LINK", dimensions: "9x5cm", printFormat: "PNG" },
  { name: "E-Ticaret Mağaza QR", qrType: "ECOMMERCE", dimensions: "10x10cm", printFormat: "PNG" },
] as const;
