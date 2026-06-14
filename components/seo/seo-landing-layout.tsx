import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { JsonLdScript } from "@/components/seo/json-ld";
import { PageHero } from "@/components/site/page-hero";
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
};

export function SeoLandingLayout({
  badge,
  title,
  subtitle,
  features,
  faqs,
  jsonLd,
  primaryCta = "Ücretsiz dene",
}: Props) {
  return (
    <div className="min-h-screen bg-[var(--surface-soft)]">
      <JsonLdScript data={jsonLd} />
      <SiteHeader />

      <main>
        <PageHero
          badge={<span className="eyebrow-dark">{badge}</span>}
          title={title}
          subtitle={subtitle}
        >
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-brand btn-brand-lg">
              {primaryCta} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="btn-outline-glass">
              Fiyatları gör
            </Link>
          </div>
        </PageHero>

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
