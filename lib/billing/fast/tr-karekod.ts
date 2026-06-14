import { buildP2pFastQr } from "@/lib/qr/iban-qr";
import { extractBankCodeFromIban } from "@/lib/qr/turkish-banks";

/**
 * Faturalandırma FAST QR — kişiden kişiye (tag 61 + tag 02).
 * Enpara, Ziraat, İş, Akbank, Yapı Kredi vb. tüm banka uygulamalarında okunur.
 */
export function buildFastTrKarekodPayload(input: {
  iban: string;
  amountTry: number;
  merchantName: string;
  referenceCode: string;
  city?: string;
}) {
  const iban = input.iban.replace(/\s/g, "").toUpperCase();
  const payload = buildP2pFastQr({
    iban,
    receiverName: input.merchantName,
    amount: String(input.amountTry),
    bankCode: extractBankCodeFromIban(iban),
    scene: "p2p",
  });

  if (!payload) {
    throw new Error("FAST_QR_INVALID");
  }

  return payload;
}
