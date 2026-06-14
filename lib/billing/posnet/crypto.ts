import { createHash } from "crypto";

/** POSNET MAC: SHA256 → Base64 */
export function posnetHash(input: string) {
  return createHash("sha256").update(input, "utf8").digest("base64");
}

export function posnetFirstHash(encKey: string, terminalId: string) {
  return posnetHash(`${encKey};${terminalId}`);
}

export function posnetMac(
  xid: string,
  amountKurus: string,
  currency: string,
  merchantId: string,
  firstHash: string,
) {
  return posnetHash(`${xid};${amountKurus};${currency};${merchantId};${firstHash}`);
}

/** POSNET XID: 20 alphanumeric */
export function posnetXidFromOrderId(orderId: string) {
  const clean = orderId.replace(/[^a-zA-Z0-9]/g, "");
  if (clean.length >= 20) return clean.slice(0, 20);
  return clean.padEnd(20, "0");
}

export function amountToKurus(amountTry: number) {
  return String(Math.round(amountTry * 100));
}
