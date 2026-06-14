import type { IbanQrScene } from "@/lib/qr/iban-qr";

export type TurkishBank = {
  code: string;
  name: string;
  defaultScene: IbanQrScene;
  scanHint: string;
  group: "buyuk" | "katilim" | "dijital" | "diger";
};

export const TURKISH_BANK_GROUPS: Record<TurkishBank["group"], string> = {
  buyuk: "Büyük Bankalar",
  katilim: "Katılım Bankaları",
  dijital: "Dijital / Neobank",
  diger: "Diğer Bankalar",
};

export const TURKISH_BANKS: TurkishBank[] = [
  { code: "00001", name: "Ziraat Bankası", defaultScene: "merchant", group: "buyuk", scanHint: "Para Transferleri → TR Karekod / QR ile Öde" },
  { code: "00004", name: "Türkiye İş Bankası", defaultScene: "merchant", group: "buyuk", scanHint: "Para Transferleri → Karekod ile FAST" },
  { code: "00005", name: "T. Halk Bankası", defaultScene: "merchant", group: "buyuk", scanHint: "FAST İşlemleri → Karekod Okut" },
  { code: "00015", name: "VakıfBank", defaultScene: "merchant", group: "buyuk", scanHint: "FAST → TR Karekod ile Öde" },
  { code: "00032", name: "TEB", defaultScene: "merchant", group: "buyuk", scanHint: "Para Transferi → Karekod ile FAST" },
  { code: "00046", name: "Akbank", defaultScene: "merchant", group: "buyuk", scanHint: "FAST → QR Kod ile Öde" },
  { code: "00059", name: "Şekerbank", defaultScene: "merchant", group: "buyuk", scanHint: "FAST → Karekod Okut" },
  { code: "00062", name: "Garanti BBVA", defaultScene: "merchant", group: "buyuk", scanHint: "FAST İşlemleri → Karekod ile Öde" },
  { code: "00067", name: "Yapı Kredi", defaultScene: "merchant", group: "buyuk", scanHint: "FAST TR Karekod → Karekod Okut" },
  { code: "00099", name: "ING", defaultScene: "merchant", group: "buyuk", scanHint: "Para Gönder → QR ile FAST" },
  { code: "00111", name: "QNB Finansbank", defaultScene: "merchant", group: "buyuk", scanHint: "FAST → Karekod ile Öde" },
  { code: "00134", name: "DenizBank", defaultScene: "merchant", group: "buyuk", scanHint: "Para Transferi → Karekod Okut" },
  { code: "00010", name: "Ziraat Katılım", defaultScene: "merchant", group: "katilim", scanHint: "FAST → TR Karekod" },
  { code: "00017", name: "Türkiye Finans", defaultScene: "merchant", group: "katilim", scanHint: "Para Transferi → Karekod FAST" },
  { code: "00203", name: "Albaraka Türk", defaultScene: "merchant", group: "katilim", scanHint: "FAST → Karekod ile Öde" },
  { code: "00205", name: "Kuveyt Türk", defaultScene: "merchant", group: "katilim", scanHint: "FAST → TR Karekod Okut" },
  { code: "00209", name: "Ziraat Katılım", defaultScene: "merchant", group: "katilim", scanHint: "FAST → Karekod" },
  { code: "00210", name: "Vakıf Katılım", defaultScene: "merchant", group: "katilim", scanHint: "FAST → Karekod ile Öde" },
  { code: "00211", name: "Emlak Katılım", defaultScene: "merchant", group: "katilim", scanHint: "FAST → Karekod Okut" },
  { code: "00212", name: "Hayat Finans", defaultScene: "merchant", group: "katilim", scanHint: "FAST → Karekod" },
  { code: "00157", name: "Enpara Bank", defaultScene: "p2p", group: "dijital", scanHint: "Para Gönder → Karekod ile Öde" },
  { code: "00159", name: "FUPS Bank", defaultScene: "p2p", group: "dijital", scanHint: "FAST → QR Karekod Okut" },
  { code: "00103", name: "Fibabanka", defaultScene: "merchant", group: "dijital", scanHint: "FAST → Karekod" },
  { code: "00146", name: "Odea Bank", defaultScene: "merchant", group: "dijital", scanHint: "Para Transferi → Karekod" },
  { code: "00150", name: "Golden Global Bank", defaultScene: "merchant", group: "dijital", scanHint: "FAST → Karekod Okut" },
  { code: "00124", name: "Alternatif Bank", defaultScene: "merchant", group: "diger", scanHint: "FAST → Karekod" },
  { code: "00123", name: "HSBC", defaultScene: "merchant", group: "diger", scanHint: "FAST → QR Ödeme" },
  { code: "00129", name: "ICBC Turkey", defaultScene: "merchant", group: "diger", scanHint: "FAST → Karekod" },
  { code: "00143", name: "Aktif Yatırım Bankası", defaultScene: "merchant", group: "diger", scanHint: "FAST → Karekod" },
  { code: "00029", name: "Birleşik Fon Bankası", defaultScene: "merchant", group: "diger", scanHint: "FAST → Karekod" },
];

const bankByCode = new Map(TURKISH_BANKS.map((b) => [b.code, b]));

export function getBankByCode(code: string) {
  const normalized = code.replace(/\D/g, "").padStart(5, "0").slice(-5);
  return bankByCode.get(normalized) ?? null;
}

export function extractBankCodeFromIban(iban: string) {
  const clean = iban.replace(/\s/g, "").toUpperCase();
  if (!clean.startsWith("TR") || clean.length < 9) return "";
  return clean.slice(4, 9);
}

export function resolveBankFromIban(iban: string) {
  return getBankByCode(extractBankCodeFromIban(iban));
}

export function banksByGroup() {
  return (Object.keys(TURKISH_BANK_GROUPS) as TurkishBank["group"][]).map((group) => ({
    group,
    label: TURKISH_BANK_GROUPS[group],
    banks: TURKISH_BANKS.filter((b) => b.group === group),
  })).filter((g) => g.banks.length > 0);
}

export function recommendedSceneForBank(bankCode: string): IbanQrScene {
  return getBankByCode(bankCode)?.defaultScene ?? "merchant";
}

export function validateIbanBankCode(iban: string, selectedBankCode: string) {
  const fromIban = extractBankCodeFromIban(iban);
  const selected = selectedBankCode.replace(/\D/g, "").padStart(5, "0").slice(-5);
  if (!fromIban || !selected) return { ok: true as const };
  if (fromIban !== selected) {
    const ibanBank = getBankByCode(fromIban);
    const picked = getBankByCode(selected);
    return {
      ok: false as const,
      message: `IBAN ${ibanBank?.name ?? fromIban} bankasına ait; seçilen: ${picked?.name ?? selected}.`,
    };
  }
  return { ok: true as const };
}

export function getBankScanHint(bankCode: string) {
  return getBankByCode(bankCode)?.scanHint ?? "Banka uygulamasında TR Karekod / FAST menüsünden okutun.";
}

/** IBAN'dan bankayı algıla — payload'a yazar (doğrulama/üretim öncesi) */
export function syncIbanPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const iban = String(payload.iban || "").replace(/\s/g, "").toUpperCase();
  if (iban.length !== 26 || !iban.startsWith("TR")) return payload;

  const detected = extractBankCodeFromIban(iban);
  if (!detected) return payload;

  const next: Record<string, unknown> = { ...payload, bankCode: detected };
  if (!payload.paymentScene) next.paymentScene = "p2p";
  return next;
}
