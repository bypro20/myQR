import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PageHero } from "@/components/site/page-hero";
import { ContactInfoPanel } from "@/components/site/contact-info-panel";
import { PaymentBadges } from "@/components/site/payment-badges";
import {
  PARTNER_EMAIL,
  buildWhatsAppUrl,
  formatWhatsAppDisplay,
  getPartnerWhatsAppMessage,
} from "@/lib/site-contact";
import { getCompanyInfo } from "@/lib/company-info";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "İletişim",
  description: "myQR iletişim ve destek kanalları. E-posta, telefon ve WhatsApp ile bize ulaşın.",
  path: "/iletisim",
});

export default function ContactPage() {
  const c = getCompanyInfo();

  return (
    <div className="min-h-screen bg-[var(--surface-soft)]">
      <SiteHeader />

      <main>
        <PageHero
          badge={
            <span className="eyebrow-dark">
              <MessageCircle className="h-3.5 w-3.5" />
              İletişim
            </span>
          }
          title={
            <>
              Size nasıl{" "}
              <span className="text-gradient">yardımcı olabiliriz?</span>
            </>
          }
          subtitle="Teknik destek, iş ortaklığı veya fatura talepleri — aşağıdaki kanallardan bize ulaşın."
        />

        <section className="relative -mt-8 pb-20">
          <div className="site-container grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href={buildWhatsAppUrl(getPartnerWhatsAppMessage("general"))}
              target="_blank"
              rel="noopener noreferrer"
              className="card-elevated card-hover p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366] text-white">
                <MessageCircle className="h-6 w-6" />
              </span>
              <p className="mt-4 font-bold text-[var(--ink)]">WhatsApp</p>
              <p className="mt-1 text-sm font-semibold text-[var(--brand)]">{formatWhatsAppDisplay()}</p>
              <p className="mt-2 text-xs text-[var(--ink-muted)]">En hızlı yanıt</p>
            </a>
            <a href="tel:+905051236824" className="card-elevated card-hover p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand)] text-white">
                <Phone className="h-6 w-6" />
              </span>
              <p className="mt-4 font-bold text-[var(--ink)]">Telefon</p>
              <p className="mt-1 text-sm font-semibold text-[var(--brand)]">{formatWhatsAppDisplay()}</p>
              <p className="mt-2 text-xs text-[var(--ink-muted)]">Hafta içi 09:00 – 18:00</p>
            </a>
            <a href={`mailto:${c.email}`} className="card-elevated card-hover p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--ink)] text-white">
                <Mail className="h-6 w-6" />
              </span>
              <p className="mt-4 font-bold text-[var(--ink)]">E-posta</p>
              <p className="mt-1 truncate text-sm font-semibold text-[var(--brand)]">{c.email}</p>
              <p className="mt-2 text-xs text-[var(--ink-muted)]">Teknik destek</p>
            </a>
            <div className="card-elevated p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--ink-soft)] text-white">
                <Clock className="h-6 w-6" />
              </span>
              <p className="mt-4 font-bold text-[var(--ink)]">Ortaklık</p>
              <a href={`mailto:${PARTNER_EMAIL}`} className="mt-1 block text-sm font-semibold text-[var(--brand)] hover:underline">
                {PARTNER_EMAIL}
              </a>
              <p className="mt-2 text-xs text-[var(--ink-muted)]">Panel kiralama</p>
            </div>
          </div>

          <div className="site-container mt-12">
            <ContactInfoPanel />
          </div>

          <div className="site-container mt-10 card-elevated p-8 text-center">
            <p className="font-semibold text-[var(--ink)]">Güvenli ödeme altyapısı</p>
            <div className="mt-4 flex justify-center">
              <PaymentBadges size="sm" />
            </div>
            <p className="mt-4 text-sm text-[var(--ink-muted)]">
              Panel kiralama başvurusu için{" "}
              <Link href="/panel-kiralama#basvuru" className="link-brand">
                başvuru formu →
              </Link>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
