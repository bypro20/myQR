import type { Metadata } from "next";
import { DEFAULT_KEYWORDS, SITE_NAME, absoluteUrl, getSiteConfig, getSiteUrl, GOOGLE_SITE_VERIFICATION } from "@/lib/seo/site-config";

type BuildMetadataInput = {
  /** Sayfa başlığı — site adı template ile eklenir (tam başlık istenirse absoluteTitle: true) */
  title: string;
  description: string;
  /** Örn. /pricing */
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  /** Varsayılan: false → "%s | myQR" template uygulanır */
  absoluteTitle?: boolean;
  ogType?: "website" | "article";
};

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const site = getSiteConfig();
  const url = absoluteUrl(input.path);
  const keywords = [...new Set([...(input.keywords || []), ...DEFAULT_KEYWORDS])];
  const title = input.absoluteTitle ? input.title : input.title;
  const ogTitle = input.absoluteTitle ? input.title : `${input.title} | ${SITE_NAME}`;

  const googleVerification = GOOGLE_SITE_VERIFICATION;
  const yandexVerification = process.env.YANDEX_SITE_VERIFICATION?.trim();
  const bingVerification = process.env.BING_SITE_VERIFICATION?.trim();

  return {
    metadataBase: new URL(getSiteUrl()),
    title: input.absoluteTitle ? { absolute: input.title } : title,
    description: input.description,
    keywords: keywords.slice(0, 20),
    alternates: {
      canonical: url,
      languages: { "tr-TR": url },
    },
    robots: input.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
        },
    openGraph: {
      type: input.ogType || "website",
      locale: site.locale,
      url,
      siteName: SITE_NAME,
      title: ogTitle,
      description: input.description,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: input.description,
    },
    verification: {
      google: googleVerification,
      ...(yandexVerification ? { yandex: yandexVerification } : {}),
      other: {
        ...(bingVerification ? { "msvalidate.01": bingVerification } : {}),
      },
    },
  };
}
