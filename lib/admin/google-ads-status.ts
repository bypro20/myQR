import {
  GA4_MEASUREMENT_ID,
  GOOGLE_ADS_ID,
  GOOGLE_ADS_PURCHASE_SEND_TO,
  GOOGLE_ADS_SIGNUP_SEND_TO,
  isGoogleTagsEnabled,
} from "@/lib/marketing/google-ads-config";
import {
  GOOGLE_ADS_CAMPAIGNS,
  GOOGLE_ADS_EXTENSIONS,
  GOOGLE_ADS_NEGATIVE_KEYWORDS,
  dailyBudgetSplit,
} from "@/lib/marketing/google-ads-playbook";

function maskId(id: string) {
  if (!id || id.length < 8) return id ? "••••" : null;
  return `${id.slice(0, 6)}••••${id.slice(-4)}`;
}

export function getGoogleAdsAdminStatus(dailyBudgetTry = 150) {
  return {
    trackingActive: isGoogleTagsEnabled(),
    signupTracking: Boolean(GOOGLE_ADS_SIGNUP_SEND_TO),
    purchaseTracking: Boolean(GOOGLE_ADS_PURCHASE_SEND_TO),
    ga4Id: maskId(GA4_MEASUREMENT_ID),
    adsId: maskId(GOOGLE_ADS_ID),
    dailyBudgetTry,
    budgetSplit: dailyBudgetSplit(dailyBudgetTry),
    campaigns: GOOGLE_ADS_CAMPAIGNS,
    negativeKeywords: GOOGLE_ADS_NEGATIVE_KEYWORDS,
    extensions: GOOGLE_ADS_EXTENSIONS,
    googleAdsUrl: "https://ads.google.com",
    searchConsoleUrl: "https://search.google.com/search-console",
  };
}

export type GoogleAdsAdminStatus = ReturnType<typeof getGoogleAdsAdminStatus>;
