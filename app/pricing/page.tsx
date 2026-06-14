import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Clock, Sparkles, Zap } from "lucide-react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PageHero } from "@/components/site/page-hero";
import { LaunchCtaSection } from "@/components/site/launch-cta-section";
import { PlanCard } from "@/components/site/plan-card";
import { CreditPackageCard } from "@/components/site/credit-package-card";
import { PaymentBadges } from "@/components/site/payment-badges";
import { PLANS } from "@/lib/plans";
import { CREDIT_PACKAGES } from "@/lib/billing/packages";
import { PRICING } from "@/lib/billing/pricing-config";
import { QrLifecyclePricing } from "@/components/billing/qr-lifecycle-pricing";
import { JsonLdScript } from "@/components/seo/json-ld";
import { pricingJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { isLaunchActive, LAUNCH, totalSignupCredits } from "@/lib/marketing/launch-config";

export const metadata = buildMetadata({
  title: "Fiyatlandırma ve QR Kod Paketleri",
  description:
    "myQR abonelik planları, kredi paketleri ve QR süre lisansları. Starter 299₺, Pro 699₺, Business 1799₺/ay. Şeffaf fiyatlandırma, gizli ücret yok.",
  path: "/pricing",
  keywords: ["qr kod fiyatları", "qr kod paketleri", "dinamik qr fiyat", "qr kod abonelik"],
});

const compareRows = [
  { feature: "Dinamik QR", starter: true, pro: true, business: true },
  { feature: "Aylık QR lisansı dahil", starter: true, pro: true, business: true },
  { feature: "Toplu üretim", starter: false, pro: true, business: true },
  { feature: "Garanti / LCV", starter: false, pro: true, business: true },
  { feature: "QR süre paketleri", starter: true, pro: true, business: true },
  { feature: "API erişimi", starter: false, pro: false, business: true },
];

export default function PricingPage() {
  const plans = PLANS.filter((p) => p.id !== "FREE");
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
              İhtiyacınıza göre{" "}
              <span className="text-gradient">ölçeklenin</span>
            </>
          }
          subtitle="Abonelik planı veya kredi paketi — gizli ücret yok. Matbaa, ajans ve perakende için net fiyatlar."
        >
          <div className="mx-auto mt-10 flex max-w-xl flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-cyan-400" /> 14 gün deneme
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-cyan-400" /> İptal kolaylığı
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-cyan-400" /> Güvenli ödeme
            </span>
          </div>
        </PageHero>

        <section className="relative -mt-8 pb-8">
          <div className="site-container">
            <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-[var(--line)] bg-white p-6 text-center shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Ücretsiz başlangıç</p>
              <p className="mt-2 text-2xl font-extrabold text-[var(--ink)]">0 ₺</p>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                {signupCredits} kredi hediye · en fazla {PRICING.free.qrLimit} QR · statik kodlar
              </p>
              <p className="mt-1 text-xs text-[var(--ink-muted)]">
                + {PRICING.trialDays} gün Pro deneme · dinamik QR {PRICING.freeQrTrialDays} gün ücretsiz deneme
              </p>
            </div>
          </div>
        </section>

        <section className="section-pad border-b border-[var(--line)] bg-white">
          <div className="site-container max-w-4xl">
            <span className="eyebrow">
              <Clock className="h-3.5 w-3.5" />
              QR yaşam döngüsü
            </span>
            <p className="section-sub mt-4">
              Profesyonel QR platformları gibi çalışır: ücretsiz deneme, süre bitince tarama durur, paket veya abonelik ile devam.
            </p>
            <div className="mt-8">
              <QrLifecyclePricing />
            </div>
          </div>
        </section>

        <section className="relative pb-16">
          <div className="site-container grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} ctaLabel={launch ? "14 gün dene" : "Başla"} />
            ))}
          </div>
        </section>

        <section className="section-pad border-y border-[var(--line)] bg-white">
          <div className="site-container max-w-4xl">
            <h2 className="text-center text-2xl font-bold text-[var(--ink)]">Plan karşılaştırması</h2>
            <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--line)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--surface-muted)] text-left">
                    <th className="px-4 py-3 font-semibold text-[var(--ink-muted)]">Özellik</th>
                    <th className="px-4 py-3 font-semibold text-[var(--ink-muted)]">Starter</th>
                    <th className="px-4 py-3 font-semibold text-[var(--ink-muted)]">Pro</th>
                    <th className="px-4 py-3 font-semibold text-[var(--ink-muted)]">Business</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((row) => (
                    <tr key={row.feature} className="border-b border-[var(--line)] last:border-0">
                      <td className="px-4 py-3 font-medium text-[var(--ink)]">{row.feature}</td>
                      {[row.starter, row.pro, row.business].map((ok, i) => (
                        <td key={i} className="px-4 py-3 text-[var(--ink-muted)]">
                          {ok ? (
                            <Check className="h-4 w-4 text-[var(--brand)]" />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="section-pad section-dark">
          <div className="site-container">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="eyebrow-dark">
                  <Zap className="h-3.5 w-3.5" />
                  Kredi paketleri
                </span>
                <h2 className="section-title mt-4 text-white">Kullandığınız kadar ödeyin</h2>
                <p className="section-sub text-slate-400">
                  Abonelik istemiyorsanız kredi yükleyin. Krediler süresiz geçerlidir — stok oluşturun, ihtiyaç oldukça harcayın.
                </p>
              </div>
              <p className="text-sm text-slate-500">
                Statik QR <strong className="text-blue-400">1</strong> · Dinamik{" "}
                <strong className="text-blue-400">3</strong> · Toplu satır{" "}
                <strong className="text-blue-400">1</strong> kredi
              </p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {CREDIT_PACKAGES.map((pkg) => (
                <CreditPackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
            <div className="mt-10 flex flex-col items-center gap-3 border-t border-white/10 pt-10">
              <PaymentBadges size="sm" />
              <p className="text-center text-xs text-slate-500">
                Kart, FAST ve Troy ·{" "}
                <Link href="/mesafeli-satis-sozlesmesi" className="text-blue-400 hover:underline">
                  Mesafeli satış sözleşmesi
                </Link>
              </p>
            </div>
          </div>
        </section>

        <LaunchCtaSection />
      </main>

      <SiteFooter />
    </div>
  );
}
