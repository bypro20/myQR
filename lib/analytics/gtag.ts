"use client";

import {
  GA4_MEASUREMENT_ID,
  GOOGLE_ADS_PURCHASE_SEND_TO,
  GOOGLE_ADS_SIGNUP_SEND_TO,
} from "@/lib/marketing/google-ads-config";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

export function trackSignupConversion() {
  if (GOOGLE_ADS_SIGNUP_SEND_TO) {
    gtag("event", "conversion", { send_to: GOOGLE_ADS_SIGNUP_SEND_TO });
  }
  if (GA4_MEASUREMENT_ID) {
    gtag("event", "sign_up", { method: "email" });
    gtag("event", "generate_lead", { currency: "TRY", value: 50 });
  }
}

export function trackPurchaseConversion(valueTry?: number) {
  if (GOOGLE_ADS_PURCHASE_SEND_TO) {
    gtag("event", "conversion", {
      send_to: GOOGLE_ADS_PURCHASE_SEND_TO,
      value: valueTry,
      currency: "TRY",
    });
  }
  if (GA4_MEASUREMENT_ID) {
    gtag("event", "purchase", {
      currency: "TRY",
      value: valueTry ?? 0,
    });
  }
}

export function trackPageViewEvent(eventName: string, params?: Record<string, unknown>) {
  gtag("event", eventName, params);
}
