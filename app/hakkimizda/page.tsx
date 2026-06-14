import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Building2, QrCode, Shield, Users } from "lucide-react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ContactInfoPanel } from "@/components/site/contact-info-panel";
import { IconBadge } from "@/components/site/icon-badge";
import { MarketingVisual } from "@/components/site/marketing-visual";
import { MARKETING_IMAGES } from "@/lib/marketing/visuals";
import { getCompanyInfo } from "@/lib/company-info";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Hakkımızda",
  description:
    "myQR dijital QR kod platformu hakkında bilgi. Matbaa, ajans ve perakende için dinamik QR, toplu üretim ve analitik SaaS hizmeti.",
  path: "/hakkimizda",
});

const values = [
  { icon: QrCode, title: "45+ QR formatı", desc: "Bankadan e-ticarete, sosyal medyadan IBAN'a — tek platformda.", gradient: "from-blue-500 to-indigo-600" },
  { icon: BarChart3, title: "Canlı analitik", desc: "Tarama verilerini gerçek zamanlı izleyin, müşterinize raporlayın.", gradient: "from-sky-500 to-blue-600" },
  { icon: Shield, title: "Kurumsal güvenlik", desc: "Tenant izolasyonu, şifreli oturum ve korumalı API.", gradient: "from-indigo-500 to-slate-700" },
  { icon: Users, title: "İş ortağı modeli", desc: "Panel kiralama ile kendi QR işinizi kurun, indirimli toptan kredi alın.", gradient: "from-blue-600 to-slate-800" },
];

export default function AboutPage() {
  const c = getCompanyInfo();

  return (
    <div className="min-h-screen bg-[var(--surface-soft)]">
      <SiteHeader />

      <main>
        <section className="page-hero relative overflow-hidden border-b border-white/10">
          <div className="aurora">
            <div className="aurora-orb aurora-orb-1" />
            <div className="aurora-orb aurora-orb-2" />
            <div className="aurora-orb aurora-orb-3" />
          </div>
          <div className="site-grid-bg absolute inset-0 opacity-[0.08]" />
          <div className="site-container relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
            <div>
              <span className="eyebrow-dark">
                <Building2 className="h-3.5 w-3.5" />
                Hakkımızda
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-balance text-white sm:text-5xl lg:text-[3.25rem]">
                QR altyapısını{" "}
                <span className="text-gradient">sadeleştiriyoruz</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300/90">
                {c.tradeName}, matbaa, ajans ve perakende işletmeleri için profesyonel QR üretim, yönetim ve analiz platformudur.
              </p>
            </div>
            <MarketingVisual
              src={MARKETING_IMAGES.heroDashboard}
              alt="myQR profesyonel QR kod yönetim platformu"
              caption="Dinamik QR, canlı analitik ve bayi paneli"
              frame="hero"
              priority
              align="right"
            />
          </div>
        </section>

        <section className="section-pad">
          <div className="site-container grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "45+", l: "QR formatı" },
              { n: "2 dk", l: "Kurulum" },
              { n: "14 gün", l: "Deneme" },
              { n: "∞", l: "Kredi stoku (ortak)" },
            ].map((s) => (
              <div key={s.l} className="card-elevated p-6 text-center">
                <p className="text-3xl font-extrabold text-[var(--ink)]">{s.n}</p>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/signup" className="btn-brand px-6 py-3">
              Ücretsiz deneyin <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="section-pad section-slate">
          <div className="site-container grid items-center gap-12 lg:grid-cols-2">
            <MarketingVisual
              src={MARKETING_IMAGES.enterpriseSecurity}
              alt="Kurumsal güvenlik ve profesyonel QR altyapısı"
              caption="Tenant izolasyonu, JWT ve BCrypt ile kurumsal güvenlik"
              frame="showcase"
              align="left"
            />
            <div>
              <h2 className="section-title text-[var(--ink)]">Neden myQR?</h2>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                {values.map(({ icon, title, desc, gradient }) => (
                  <article key={title} className="card-elevated flex gap-4 p-6">
                    <IconBadge icon={icon} gradient={gradient} />
                    <div>
                      <h3 className="font-bold text-[var(--ink)]">{title}</h3>
                      <p className="mt-1 text-sm text-[var(--ink-muted)]">{desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad bg-white">
          <div className="site-container">
            <h2 className="section-title text-[var(--ink)]">Satıcı bilgileri</h2>
            <div className="mt-8">
              <ContactInfoPanel />
            </div>
            <p className="mt-8 text-sm text-[var(--ink-muted)]">
              Fiyatlandırma için{" "}
              <Link href="/pricing" className="link-brand">
                planlar sayfasına
              </Link>{" "}
              bakın; bayi modeli için{" "}
              <Link href="/panel-kiralama" className="link-brand">
                panel kiralama
              </Link>
              .
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
