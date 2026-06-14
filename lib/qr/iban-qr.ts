/** Türkiye FAST / TR Karekod — TCMB EMVCo format (tüm banka uygulamaları) */

import { extractBankCodeFromIban } from "@/lib/qr/turkish-banks";

export type IbanQrScene = "merchant" | "p2p";

export type IbanQrInput = {
  iban: string;
  receiverName: string;
  amount?: string;
  description?: string;
  bankCode?: string;
  scene?: IbanQrScene;
};

function emvAscii(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "O")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "U")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

function byteLength(value: string) {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value).length;
  }
  return Buffer.byteLength(value, "utf8");
}

function tlv(id: string, value: string) {
  const safe = emvAscii(value);
  const len = byteLength(safe).toString().padStart(2, "0");
  return `${id}${len}${safe}`;
}

function crc16Ccitt(data: string) {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function withCrc(payload: string) {
  const base = `${payload}6304`;
  return base + crc16Ccitt(base);
}

function normalizeIban(raw: string) {
  return raw.replace(/\s/g, "").toUpperCase();
}

function normalizeAmount(raw?: string) {
  if (!raw?.trim()) return "";
  const n = Number(String(raw).replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return "";
  return (Math.round(n * 100) / 100).toFixed(2);
}

function formatAmountField(amount: string) {
  const cents = Math.round(Number(amount) * 100);
  return cents.toString().padStart(12, "0");
}

/** TCMB zorunlu tag 02 — IBAN bankasının EFT kodu (4 hane) */
function qrGeneratorId(bankCode?: string, iban?: string) {
  const fromBank = bankCode?.replace(/\D/g, "");
  const fromIban = iban ? extractBankCodeFromIban(iban) : "";
  const raw = fromBank || fromIban || "0067";
  return raw.padStart(4, "0").slice(-4);
}

/**
 * İşyeri / IBAN levhası — EMV tag 30 (TR.GOV.TCMB.FAST)
 * Yapı Kredi, Ziraat, Garanti, İş Bankası, Enpara işyeri ödemesi vb.
 */
export function buildMerchantFastQr(input: IbanQrInput) {
  const iban = normalizeIban(input.iban);
  const name = emvAscii(input.receiverName).substring(0, 25);
  const amount = normalizeAmount(input.amount);

  if (!iban.startsWith("TR") || iban.length !== 26) return "";

  const fastBlock =
    tlv("00", "TR.GOV.TCMB.FAST") +
    tlv("01", iban) +
    tlv("02", "02"); // statik işyeri doğrulama

  let payload = "";
  payload += tlv("00", "01");
  payload += tlv("01", "11"); // statik karekod
  payload += tlv("30", fastBlock);
  payload += tlv("52", "0000");
  payload += tlv("53", "949");

  if (amount) {
    payload += tlv("54", formatAmountField(amount));
  }

  payload += tlv("58", "TR");

  if (name) {
    payload += tlv("59", name);
  }

  if (input.description?.trim()) {
    const ref = tlv("07", emvAscii(input.description).substring(0, 25));
    payload += tlv("62", ref);
  }

  return withCrc(payload);
}

/**
 * Kişiden kişiye — tag 61 uygulama şablonu, akış türü 03
 * Enpara, Ziraat vb. "QR ile para gönder" akışı
 */
export function buildP2pFastQr(input: IbanQrInput) {
  const iban = normalizeIban(input.iban);
  const name = emvAscii(input.receiverName).substring(0, 26);
  const amount = normalizeAmount(input.amount);
  const genId = qrGeneratorId(input.bankCode, iban);

  if (!iban.startsWith("TR") || iban.length !== 26) return "";
  if (!name) return "";

  const appBlock =
    tlv("01", iban) +
    tlv("07", name) +
    tlv("10", "03"); // kişiden kişiye — zorunlu

  let payload = "";
  payload += tlv("75", "10"); // TR Karekod sürüm 1.0 (P2P)
  payload += tlv("01", "11"); // statik
  payload += tlv("02", genId); // karekod üretici kodu — TCMB zorunlu
  payload += tlv("61", appBlock);

  if (amount) {
    payload += tlv("54", formatAmountField(amount));
  }

  return withCrc(payload);
}

/** Banka seçimine göre önerilen format; paymentScene ile override edilebilir */
export function buildTurkishIbanQr(input: IbanQrInput) {
  const scene = input.scene || "p2p";
  if (scene === "p2p") return buildP2pFastQr(input);
  return buildMerchantFastQr(input);
}
