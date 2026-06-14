import { PLANS } from "@/lib/plans";
import { PRICING } from "@/lib/billing/pricing-config";
import { getSiteConfig, absoluteUrl } from "@/lib/seo/site-config";

export type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  const site = getSiteConfig();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.tradeName,
    legalName: site.legalName,
    url: site.url,
    email: site.email,
    ...(site.phone ? { telephone: site.phone } : {}),
    logo: absoluteUrl("/icon"),
    sameAs: [],
  };
}

export function webSiteJsonLd(): JsonLd {
  const site = getSiteConfig();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    inLanguage: "tr-TR",
    description: site.description,
    publisher: { "@type": "Organization", name: site.tradeName, url: site.url },
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}/pricing?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareApplicationJsonLd(): JsonLd {
  const site = getSiteConfig();
  const starter = PLANS.find((p) => p.id === "STARTER");
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: site.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: site.url,
    description: site.description,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "0",
      highPrice: String(starter?.priceTry || 299),
      priceCurrency: "TRY",
      offerCount: PLANS.filter((p) => p.id !== "FREE").length,
    },
    featureList: [
      "Dinamik QR kod",
      "Toplu QR üretimi",
      "Tarama analitiği",
      "Garanti ve LCV modülleri",
      "45+ QR formatı",
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function productOfferJsonLd(): JsonLd {
  const site = getSiteConfig();
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${site.name} QR Kod Platformu`,
    description: site.description,
    brand: { "@type": "Brand", name: site.name },
    offers: PLANS.filter((p) => p.id !== "FREE").map((p) => ({
      "@type": "Offer",
      name: `${p.name} Plan`,
      price: p.priceTry,
      priceCurrency: "TRY",
      url: absoluteUrl("/pricing"),
      availability: "https://schema.org/InStock",
    })),
  };
}

export function homepageJsonLd(): JsonLd[] {
  return [organizationJsonLd(), webSiteJsonLd(), softwareApplicationJsonLd()];
}

export function pricingJsonLd(): JsonLd[] {
  return [breadcrumbJsonLd([{ name: "Ana Sayfa", path: "/" }, { name: "Fiyatlandırma", path: "/pricing" }]), productOfferJsonLd()];
}

export function landingPageJsonLd(opts: {
  path: string;
  title: string;
  description: string;
  faqs: { question: string; answer: string }[];
}): JsonLd[] {
  const site = getSiteConfig();
  return [
    breadcrumbJsonLd([
      { name: "Ana Sayfa", path: "/" },
      { name: opts.title, path: opts.path },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: opts.title,
      description: opts.description,
      url: absoluteUrl(opts.path),
      inLanguage: "tr-TR",
      isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    },
    faqJsonLd(opts.faqs),
  ];
}

export function freeTrialNote() {
  return `${PRICING.trialDays} gün Pro denemesi, ${PRICING.freeQrTrialDays} gün dinamik QR denemesi`;
}
