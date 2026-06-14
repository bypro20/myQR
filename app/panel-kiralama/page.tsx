import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Coins,
  CreditCard,
  Landmark,
  Layers,
  Megaphone,
  MessageCircle,
  Printer,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { PageHero } from "@/components/site/page-hero";
import { IconBadge } from "@/components/site/icon-badge";
import { PartnerInquiryForm } from "@/components/site/partner-inquiry-form";
import { buildWhatsAppUrl, formatWhatsAppDisplay, getPartnerWhatsAppMessage } from "@/lib/site-contact";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Panel Kiralama — İş Ortağı Programı",
  description:
    "myQR panel kiralama ve bayi programı. İndirimli toptan kredi, müşteri başına panel, kendi fiyatınızla QR hizmeti satın.",
  path: "/panel-kiralama",
  keywords: ["qr kod bayi", "qr panel kiralama", "qr kod iş ortağı", "toptan qr kredi"],
});

const steps = [
  {
    step: "01",
    title: "İş ortağı hesabı açın",
    desc: "myQR'den kayıt olun veya bizimle iletişime geçin. Size özel yönetim paneli ve kredi yükleme yetkisi tanımlanır.",
    icon: Building2,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    step: "02",
    title: "İndirimli kredi satın alın",
    desc: "İş ortağı olarak sitedeki paket fiyatlarından bağımsız, size özel indirimli toptan kredi alırsınız.",
    icon: Coins,
    gradient: "from-sky-500 to-blue-600",
  },
  {
    step: "03",
    title: "Müşterilerinize panel açın",
    desc: "Her müşteriniz için ayrı panel ve organizasyon oluşturun. QR kodları, analitik ve formlar kendi alanlarında yönetilir.",
    icon: Layers,
    gradient: "from-indigo-500 to-blue-700",
  },
  {
    step: "04",
    title: "Kendi fiyatınızla satın",
    desc: "Kredileri paketleyip müşterilerinize istediğiniz fiyattan sunun. Siz satış ve ilişkiyi yönetin, altyapı bizde.",
    icon: TrendingUp,
    gradient: "from-blue-600 to-slate-800",
  },
];

const audiences = [
  { title: "Matbaa & baskı merkezleri", desc: "QR baskı siparişlerinde müşteriye hazır panel teslim edin.", icon: Printer, gradient: "from-blue-500 to-indigo-600" },
  { title: "Reklam & dijital ajanslar", desc: "Marka projelerine QR altyapısı ekleyin, müşteri paneli açın.", icon: Sparkles, gradient: "from-sky-500 to-blue-600" },
  { title: "Yazılım & entegratör firmalar", desc: "Kendi çözümünüze myQR panelini gömün veya yan hizmet olarak sunun.", icon: Workflow, gradient: "from-indigo-500 to-blue-700" },
  { title: "Perakende & franchise ağları", desc: "Şube bazlı QR yönetimi, garanti kayıtları ve toplu üretim.", icon: Store, gradient: "from-slate-600 to-blue-800" },
];

const benefits = [
  "İş ortaklarına kredilerde özel indirim — fiyatlandırma paket sayfasından ayrı",
  "Müşteri başına izole panel ve veri alanı",
  "Toptan kredi ile yüksek marj potansiyeli",
  "45+ QR formatı hazır — geliştirme maliyeti yok",
  "Dinamik QR, analitik ve toplu üretim dahil",
  "Siz satış yapın, biz altyapıyı güncel tutalım",
  "İstediğiniz kadar müşteri paneli açın",
];

const faqs = [
  {
    q: "Panel kiralama tam olarak ne demek?",
    a: "myQR altyapısını kendi markanız veya hizmet paketiniz altında müşterilerinize sunarsınız. Siz kredi satın alır, müşterilerinize panel açar ve kendi fiyatlandırmanızla satarsınız.",
  },
  {
    q: "Her müşteri için ayrı panel mi açılıyor?",
    a: "Evet. Her müşteriniz kendi organizasyon panelinde QR kodlarını, formlarını ve raporlarını bağımsız yönetir.",
  },
  {
    q: "Kredileri nasıl satın alırım?",
    a: "Panel kiralayan iş ortakları, sitedeki standart kredi paketlerinden değil; size özel tanımlanan indirimli toptan fiyatlar üzerinden kredi yükler.",
  },
  {
    q: "Fiyatlandırma sayfasındaki paketler geçerli mi?",
    a: "Hayır. /pricing sayfasındaki abonelik ve kredi paketleri son kullanıcılar içindir. Panel kiralama modelinde fiyatlandırma tamamen farklıdır.",
  },
  {
    q: "Teknik bilgi gerekir mi?",
    a: "Hayır. Panel arayüzü hazır; siz satış, kurulum ve müşteri desteğine odaklanırsınız.",
  },
];

export default function PanelKiralamaPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-soft)]">
      <SiteHeader />

      <main>
        <PageHero
          align="left"
          badge={
            <span className="eyebrow-dark">
              <Users className="h-3.5 w-3.5" />
              İş ortağı · Panel kiralama
            </span>
          }
          title={
            <>
              Panelinizi{" "}
              <span className="text-gradient">kiralayın</span>, müşterilerinize satın
            </>
          }
          subtitle="myQR altyapısıyla kendi QR işinizi kurun. Panel kiralayan iş ortaklarına kredilerde özel indirim — toptan iş ortağı fiyatlandırması."
        />

        <section className="section-pad">
          <div className="site-container grid items-start gap-12 lg:grid-cols-2">
            <div className="card-elevated border-[var(--brand)]/20 bg-[var(--brand-soft)] p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-white">
                  <Megaphone className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">Duyuru</p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-[var(--ink)]">
                    Panel kiralayıp bu işi kendisi yapacak iş ortaklarına kredilerde indirim uyguluyoruz.
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                    Fiyatlandırma sayfasındaki paketler son kullanıcı içindir. Siz indirimli toptan kredi alır,
                    müşterilerinize kendi panelinizi açar ve kendi fiyatınızla satarsınız.
                  </p>
                </div>
              </div>
            </div>

            <div className="card-elevated p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Bayi akışı</p>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Siz (iş ortağı)", sub: "Kredi stoku · Panel yönetimi" },
                  { label: "↓ Müşteri A paneli", sub: "Restoran · 500 kredi" },
                  { label: "↓ Müşteri B paneli", sub: "Matbaa müşterisi · 2.000 kredi" },
                  { label: "↓ Müşteri C paneli", sub: "Ajans projesi · 150 kredi" },
                ].map((row) => (
                  <div key={row.label} className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3">
                    <div className="mb-1.5 h-1 w-10 rounded-full bg-[var(--brand)]" />
                    <p className="text-sm font-bold text-[var(--ink)]">{row.label}</p>
                    <p className="text-xs text-[var(--ink-muted)]">{row.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="site-container mt-10 flex flex-wrap gap-3">
            <a
              href={buildWhatsAppUrl(getPartnerWhatsAppMessage("apply"))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp ile başvur
            </a>
            <Link href="#basvuru" className="btn-brand px-6 py-3">
              Başvuru formu <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/signup" className="btn-outline px-6 py-3">
              Önce hesap aç
            </Link>
          </div>
          <p className="site-container mt-4 text-xs font-medium text-[var(--ink-muted)]">
            WhatsApp: {formatWhatsAppDisplay()} · İndirimli toptan kredi · Müşteri başına panel
          </p>
        </section>

        <section className="section-pad section-slate">
          <div className="site-container">
            <span className="section-badge">
              <Workflow className="h-3.5 w-3.5" />
              Nasıl çalışır?
            </span>
            <h2 className="section-title mt-4 text-[var(--ink)]">
              Dört adımda <span className="text-gradient">kendi QR işiniz</span>
            </h2>
            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {steps.map(({ step, title, desc, icon, gradient }) => (
                <article key={step} className="card-elevated card-hover p-6">
                  <div className="flex items-start gap-4">
                    <IconBadge icon={icon} gradient={gradient} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">{step}</p>
                      <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{desc}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad bg-white">
          <div className="site-container">
            <div className="text-center">
              <h2 className="section-title text-[var(--ink)]">Kimler için ideal?</h2>
              <p className="section-sub mx-auto">QR hizmetini müşterilerine paketlemek isteyen her işletme.</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {audiences.map(({ title, desc, icon, gradient }) => (
                <article key={title} className="card-elevated card-hover p-5">
                  <IconBadge icon={icon} gradient={gradient} size="lg" />
                  <h3 className="mt-4 font-bold text-[var(--ink)]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="site-container grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="section-title text-[var(--ink)]">
                Siz satışa odaklanın, <span className="text-gradient">gerisini biz halledelim</span>
              </h2>
              <ul className="mt-6 space-y-3">
                {benefits.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[var(--ink-muted)]">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href={buildWhatsAppUrl(getPartnerWhatsAppMessage("pricing"))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp mt-8"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp ile teklif al
              </a>
            </div>
            <div className="card-elevated p-8">
              <p className="font-bold text-[var(--ink)]">İş ortağı fiyatlandırması</p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">Paket sayfası değil — indirimli toptan kredi modeli.</p>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Son kullanıcı paket fiyatları", val: "Geçerli değil", tone: "text-slate-400 line-through" },
                  { label: "İş ortağı toptan kredi", val: "İndirimli", tone: "text-[var(--brand)]" },
                  { label: "Müşteriye sattığınız fiyat", val: "Tamamen sizin", tone: "text-[var(--ink)]" },
                  { label: "Kalan kredi stoku", val: "Hesabınızda kalır", tone: "text-[var(--ink-muted)]" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-xl bg-[var(--surface-muted)] px-4 py-3 text-sm">
                    <span className="font-medium text-[var(--ink)]">{row.label}</span>
                    <span className={`font-bold ${row.tone}`}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="basvuru" className="section-pad section-slate">
          <div className="site-container">
            <div className="mx-auto max-w-2xl text-center">
              <span className="section-badge">
                <MessageCircle className="h-3.5 w-3.5" />
                Başvuru & iletişim
              </span>
              <h2 className="section-title mt-4 text-[var(--ink)]">
                İş ortağı başvurunuzu <span className="text-gradient">hemen iletin</span>
              </h2>
              <p className="section-sub mx-auto">
                Formu doldurun veya WhatsApp üzerinden yazın. Size özel indirimli toptan kredi teklifi paylaşılır.
              </p>
            </div>
            <div className="mt-14">
              <PartnerInquiryForm />
            </div>
          </div>
        </section>

        <section className="section-pad bg-white">
          <div className="site-container">
            <span className="section-badge">
              <CreditCard className="h-3.5 w-3.5" />
              Ödeme & kredi
            </span>
            <h2 className="section-title mt-4 text-[var(--ink)]">İş ortakları nasıl ödeme yapar?</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {[
                { icon: CreditCard, title: "Kart ile ödeme", desc: "Kredi kartı, banka kartı ve Troy — 3D Secure güvenli ödeme.", gradient: "from-blue-500 to-indigo-600" },
                { icon: Landmark, title: "FAST / Havale", desc: "Tüm bankalardan transfer. IBAN ve referans kodu ile ödeme.", gradient: "from-sky-500 to-blue-600" },
                { icon: MessageCircle, title: "Teklif & fatura", desc: "Yüksek hacimli ortaklar için WhatsApp veya e-posta ile özel teklif.", gradient: "from-indigo-500 to-slate-700" },
              ].map(({ icon, title, desc, gradient }) => (
                <article key={title} className="card-elevated p-6">
                  <IconBadge icon={icon} gradient={gradient} />
                  <h3 className="mt-4 font-bold text-[var(--ink)]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad border-t border-[var(--line)]">
          <div className="site-container max-w-3xl">
            <h2 className="text-center text-2xl font-bold text-[var(--ink)]">Sık sorulan sorular</h2>
            <div className="mt-10 space-y-4">
              {faqs.map(({ q, a }) => (
                <details key={q} className="group card-elevated p-5 open:shadow-lg">
                  <summary className="cursor-pointer list-none font-semibold text-[var(--ink)] marker:content-none [&::-webkit-details-marker]:hidden">
                    {q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad section-dark">
          <div className="site-container text-center">
            <h2 className="section-title text-white text-balance">
              QR işinizi <span className="text-gradient">bugün başlatın</span>
            </h2>
            <p className="section-sub mx-auto text-slate-400">
              Hemen kayıt olun veya satış ekibimizle görüşerek indirimli toptan kredi koşullarını öğrenin.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={buildWhatsAppUrl(getPartnerWhatsAppMessage("apply"))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp px-8 py-3.5"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp: {formatWhatsAppDisplay()}
              </a>
              <Link href="#basvuru" className="btn-brand btn-brand-lg">
                Başvuru formu <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
