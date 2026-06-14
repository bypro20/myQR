import Script from "next/script";
import {
  GA4_MEASUREMENT_ID,
  GOOGLE_ADS_ID,
  isGoogleTagsEnabled,
  primaryGtagId,
} from "@/lib/marketing/google-ads-config";

export function GoogleTags() {
  if (!isGoogleTagsEnabled()) return null;

  const primary = primaryGtagId();
  const configLines = [
    GA4_MEASUREMENT_ID ? `gtag('config', '${GA4_MEASUREMENT_ID}');` : "",
    GOOGLE_ADS_ID && GOOGLE_ADS_ID !== GA4_MEASUREMENT_ID
      ? `gtag('config', '${GOOGLE_ADS_ID}');`
      : "",
  ]
    .filter(Boolean)
    .join("\n          ");

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primary}`}
        strategy="afterInteractive"
      />
      <Script id="google-tags-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${configLines}
        `}
      </Script>
    </>
  );
}
