export type FastPaymentConfig = {
  iban: string;
  accountName: string;
  bankName: string;
};

export function isFastPaymentEnabled() {
  const iban = process.env.PAYMENT_IBAN || process.env.FAST_IBAN;
  return Boolean(iban && process.env.PAYMENT_ACCOUNT_NAME);
}

export function getFastPaymentConfig(): FastPaymentConfig {
  const iban = (process.env.PAYMENT_IBAN || process.env.FAST_IBAN || "").replace(/\s/g, "").toUpperCase();
  const accountName = process.env.PAYMENT_ACCOUNT_NAME || "";
  if (!iban || !accountName) {
    throw new Error("FAST_NOT_CONFIGURED");
  }
  return {
    iban,
    accountName,
    bankName: process.env.PAYMENT_BANK_NAME || "Banka",
  };
}

export function buildFastOrderMeta(orderId: string, referenceCode: string) {
  return {
    method: "fast",
    referenceCode,
    provider: "fast_transfer",
    orderId,
  };
}
