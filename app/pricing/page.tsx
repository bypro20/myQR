import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PageHero } from "@/components/site/page-hero";
import { LaunchCtaSection } from "@/components/site/launch-cta-section";
import { PricingPageClient } from "@/components/site/pricing-page-client";
import { PRICING } from "@/lib/billing/pricing-config";
import { JsonLdScript } from "@/components/seo/json-ld";
import { pricingJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { isLaunchActive, LAUNCH, totalSignupCredits } from "@/lib/marketing/launch-config";

export const metadata: Metadata = buildMetadata({
  title: "Fiyatlandırma ve QR Kod Paketleri",
  description:
    "myQR abonelik planları ve kredi paketleri ayrı satın alınabilir. Starter 299₺, Pro 699₺, Business 1799₺/ay. Kredi paketleri 179₺'den başlar.",
  path: "/pricing",
  keywords: ["qr kod fiyatları", "qr kod paketleri", "dinamik qr fiyat", "qr kod abonelik", "qr kredi paketi"],
});

export default function PricingPage() {
  const launch = isLaunchActive();
  const signupCredits = totalSignupCredits();

  return (
    <div className="min-h-screen bg-[var(--surface-soft)]">
      <JsonLdScript data={pricingJsonLd()} />
      <SiteHeader />

      <main>
        <PageHero
          badge={
            <span className="eyebrow-dark">
              <Sparkles className="h-3.5 w-3.5" />
              {launch ? LAUNCH.label : "Şeffaf fiyatlandırma"}
            </span>
          }
          title={
            <>
              Abonelik ve kredi{" "}
              <span className="text-gradient">ayrı ayrı</span>
            </>
          }
          subtitle="Plan mı, tek seferlik kredi mi? İkisini de doğrudan satın alın — gizli ücret yok, butonlar açık."
        >
          <div className="mx-auto mt-10 flex max-w-xl flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-cyan-400" /> Anında ödeme
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-cyan-400" /> Kart & FAST
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-cyan-400" /> İptal kolaylığı
            </span>
          </div>
        </PageHero>

        <section className="relative -mt-6 pb-4">
          <div className="site-container">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl border border-dashed border-[var(--line)] bg-white p-6 text-center shadow-sm sm:flex-row sm:justify-between sm:text-left">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Ücretsiz başlangıç</p>
                <p className="mt-1 text-2xl font-extrabold text-[var(--ink)]">0 ₺</p>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  {signupCredits} kredi hediye · en fazla {PRICING.free.qrLimit} QR
                </p>
              </div>
              <Link href="/signup" className="btn-brand shrink-0 px-6 py-2.5 text-sm">
                Ücretsiz başla
              </Link>
            </div>
          </div>
        </section>

        <PricingPageClient />

        <LaunchCtaSection />
      </main>

      <SiteFooter />
    </div>
  );
}
