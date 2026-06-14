import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { JsonLdScript } from "@/components/seo/json-ld";
import { MarketingVisual } from "@/components/site/marketing-visual";
import type { JsonLd } from "@/lib/seo/json-ld";

type Faq = { question: string; answer: string };

type Props = {
  badge: string;
  title: ReactNode;
  subtitle: string;
  features: string[];
  faqs: Faq[];
  jsonLd: JsonLd[];
  primaryCta?: string;
  heroImage?: { src: string; alt: string; caption?: string };
  showcaseImage?: { src: string; alt: string; caption?: string; title?: string; subtitle?: string };
};

export function SeoLandingLayout({
  badge,
  title,
  subtitle,
  features,
  faqs,
  jsonLd,
  primaryCta = "Ücretsiz dene",
  heroImage,
  showcaseImage,
}: Props) {
  const ctaBlock = (
    <div className="mt-10 flex flex-wrap gap-3">
      <Link href="/signup" className="btn-brand btn-brand-lg">
        {primaryCta} <ArrowRight className="h-4 w-4" />
      </Link>
      <Link href="/pricing" className="btn-outline-glass">
        Fiyatları gör
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--surface-soft)]">
      <JsonLdScript data={jsonLd} />
      <SiteHeader />

      <main>
        {heroImage ? (
          <section className="page-hero relative overflow-hidden border-b border-white/10">
            <div className="aurora">
              <div className="aurora-orb aurora-orb-1" />
              <div className="aurora-orb aurora-orb-2" />
              <div className="aurora-orb aurora-orb-3" />
            </div>
            <div className="site-grid-bg absolute inset-0 opacity-[0.08]" />
            <div className="site-container relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
              <div>
                <span className="eyebrow-dark">{badge}</span>
                <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-balance text-white sm:text-5xl lg:text-[3.25rem]">
                  {title}
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300/90">{subtitle}</p>
                {ctaBlock}
              </div>
              <MarketingVisual
                src={heroImage.src}
                alt={heroImage.alt}
                caption={heroImage.caption}
                frame="hero"
                priority
                align="right"
              />
            </div>
          </section>
        ) : (
          <section className="page-hero relative overflow-hidden border-b border-white/10">
            <div className="aurora">
              <div className="aurora-orb aurora-orb-1" />
              <div className="aurora-orb aurora-orb-2" />
              <div className="aurora-orb aurora-orb-3" />
            </div>
            <div className="site-grid-bg absolute inset-0 opacity-[0.08]" />
            <div className="site-container relative py-20 text-center lg:py-28">
              <span className="eyebrow-dark">{badge}</span>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-balance text-white sm:text-5xl lg:text-[3.25rem]">
                {title}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300/90">{subtitle}</p>
              <div className="flex justify-center">{ctaBlock}</div>
            </div>
          </section>
        )}

        {showcaseImage ? (
          <section className="section-pad border-b border-[var(--line)] bg-white">
            <div className="site-container">
              {showcaseImage.title ? (
                <div className="mx-auto mb-10 max-w-2xl text-center">
                  <h2 className="section-title text-[var(--ink)]">{showcaseImage.title}</h2>
                  {showcaseImage.subtitle ? (
                    <p className="section-sub mx-auto">{showcaseImage.subtitle}</p>
                  ) : null}
                </div>
              ) : null}
              <MarketingVisual
                src={showcaseImage.src}
                alt={showcaseImage.alt}
                caption={showcaseImage.caption}
                frame="wide"
              />
            </div>
          </section>
        ) : null}

        <section className="section-pad border-b border-[var(--line)] bg-white">
          <div className="site-container max-w-3xl">
            <h2 className="section-title text-[var(--ink)]">Öne çıkan özellikler</h2>
            <ul className="mt-8 space-y-4">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[var(--ink-muted)]">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section-pad section-slate">
          <div className="site-container max-w-3xl">
            <h2 className="section-title text-[var(--ink)]">Sık sorulan sorular</h2>
            <div className="mt-8 space-y-4">
              {faqs.map((f) => (
                <details key={f.question} className="card-glow group p-5">
                  <summary className="cursor-pointer list-none font-bold text-[var(--ink)] marker:content-none">
                    {f.question}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">{f.answer}</p>
                </details>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/signup" className="btn-brand inline-flex px-6 py-3">
                Hemen başla <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
