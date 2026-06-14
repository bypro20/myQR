import { isFastPaymentEnabled } from "@/lib/billing/fast/config";
import { isIyzicoConfigured } from "@/lib/billing/iyzico/client";
import { isPosnetConfigured } from "@/lib/billing/posnet/config";

export function isLivePaymentEnabled() {
  return process.env.PAYMENT_MODE === "live";
}

export function isCardPaymentEnabled() {
  return isLivePaymentEnabled() && (isPosnetConfigured() || isIyzicoConfigured());
}

export function isFastPaymentAvailable() {
  return isLivePaymentEnabled() && isFastPaymentEnabled();
}

export function getCardProvider(): "posnet" | "iyzico" | null {
  if (!isLivePaymentEnabled()) return null;
  if (isPosnetConfigured()) return "posnet";
  if (isIyzicoConfigured()) return "iyzico";
  return null;
}

export function isPaymentCheckoutReady() {
  return isCardPaymentEnabled() || isFastPaymentAvailable();
}

export function getPaymentProvider() {
  if (getCardProvider()) return getCardProvider()!;
  if (isFastPaymentAvailable()) return "fast_transfer";
  return "checkout";
}
