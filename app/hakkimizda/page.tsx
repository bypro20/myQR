import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Building2, QrCode, Shield, Users } from "lucide-react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PageHero } from "@/components/site/page-hero";
import { ContactInfoPanel } from "@/components/site/contact-info-panel";
import { IconBadge } from "@/components/site/icon-badge";
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
        <PageHero
          align="left"
          badge={
            <span className="eyebrow-dark">
              <Building2 className="h-3.5 w-3.5" />
              Hakkımızda
            </span>
          }
          title={
            <>
              QR altyapısını{" "}
              <span className="text-gradient">sadeleştiriyoruz</span>
            </>
          }
          subtitle={`${c.tradeName}, matbaa, ajans ve perakende işletmeleri için profesyonel QR üretim, yönetim ve analiz platformudur.`}
        />

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
          <div className="site-container">
            <h2 className="section-title text-[var(--ink)]">Neden myQR?</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
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
