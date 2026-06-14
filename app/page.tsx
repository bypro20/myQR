import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Lock, Sparkles, Users, Zap } from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JsonLdScript } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ContactInfoPanel } from "@/components/site/contact-info-panel";
import { HowItWorksSection } from "@/components/site/how-it-works-section";
import { LaunchCtaSection } from "@/components/site/launch-cta-section";
import { UseCasesSection } from "@/components/site/use-cases-section";
import { QrLifecyclePricing } from "@/components/billing/qr-lifecycle-pricing";
import { IconBadge } from "@/components/site/icon-badge";
import { PlanCard } from "@/components/site/plan-card";
import { PaymentBadges } from "@/components/site/payment-badges";
import { FEATURE_THEMES } from "@/lib/marketing/theme";
import { PRICING } from "@/lib/billing/pricing-config";
import { homepageJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { isLaunchActive, LAUNCH, signupOfferLine, totalSignupCredits } from "@/lib/marketing/launch-config";
import { PLANS } from "@/lib/plans";

const features = [
  {
    title: "45+ hazır QR formatı",
    desc: "Menü, Wi-Fi, WhatsApp, vCard, garanti ve LCV — müşterinizin ihtiyacına göre saniyeler içinde üretin.",
  },
  {
    title: "Dinamik yönlendirme",
    desc: "Baskıyı yenilemeden hedefi güncelleyin. Kampanya, menü veya fiyat değişikliğinde QR aynı kalır.",
  },
  {
    title: "Toplu üretim",
    desc: "CSV ile yüzlerce kodu tek seferde oluşturun, ZIP indirin, matbaa sürecine doğrudan aktarın.",
  },
  {
    title: "Canlı analitik",
    desc: "Kim, ne zaman, hangi cihazdan taradı — performansı ölçün, yatırımınızın karşılığını görün.",
  },
  {
    title: "QR süre lisansı",
    desc: "15 gün deneme, haftalık/aylık/yıllık/kalıcı paketler — sektör standardı gelir modeli.",
  },
  {
    title: "Kurumsal güvenlik",
    desc: "Tenant izolasyonu, şifreli oturum ve korumalı API — müşteri veriniz güvende.",
  },
];

export const metadata: Metadata = buildMetadata({
  absoluteTitle: true,
  title: "myQR | Profesyonel QR Kod Platformu — Dinamik QR & Toplu Üretim",
  description: `Matbaa, ajans ve perakende için dinamik QR, toplu üretim ve analitik. ${PRICING.trialDays} gün Pro denemesi, ${totalSignupCredits()} hoş geldin kredisi — kredi kartı gerekmez.`,
  path: "/",
  keywords: ["qr kod oluştur", "dinamik qr kod türkiye", "qr kod platformu", "toplu qr kod"],
});

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const launch = isLaunchActive();
  const previewPlans = PLANS.filter((p) => p.id !== "FREE").slice(0, 3);
  const signupCredits = totalSignupCredits();

  return (
    <div className="min-h-screen bg-[var(--surface-soft)]">
      <JsonLdScript data={homepageJsonLd()} />
      <SiteHeader />

      <main>
        <section className="page-hero relative overflow-hidden">
          <div className="aurora">
            <div className="aurora-orb aurora-orb-1" />
            <div className="aurora-orb aurora-orb-2" />
            <div className="aurora-orb aurora-orb-3" />
          </div>
          <div className="site-grid-bg absolute inset-0 opacity-[0.08]" />

          <div className="site-container relative grid items-center gap-16 py-20 lg:grid-cols-2 lg:py-28">
            <div className="animate-fade-up">
              <span className="eyebrow-dark">
                <Sparkles className="h-3.5 w-3.5" />
                {launch ? `${LAUNCH.label} · Matbaa · Ajans · Perakende` : "Matbaa · Ajans · Perakende"}
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[3.5rem] text-balance">
                QR kodunuzla{" "}
                <span className="text-gradient-warm">gelir kazanın</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300/90">
                Profesyonel QR platformu: üretin, müşterinize satın, süre uzatmasından tekrarlayan gelir elde edin.
                Dinamik QR, toplu baskı ve canlı analitik — tek panelde.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/signup" className="btn-brand btn-brand-lg animate-pulse-glow">
                  {launch ? LAUNCH.ctaPrimary : "14 gün ücretsiz dene"} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/pricing" className="btn-outline-glass">
                  {launch ? LAUNCH.ctaSecondary : "Paketleri incele"}
                </Link>
              </div>
              <p className="mt-4 text-xs font-semibold tracking-wide text-fuchsia-300/90">
                ✦ {signupOfferLine()} · Kredi kartı gerekmez
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                {[
                  { label: "QR formatı", value: "45+" },
                  { label: "Kurulum", value: "2 dk" },
                  { label: "Hoş geldin", value: `${signupCredits} kr` },
                ].map((s) => (
                  <div key={s.label} className="stat-pill">
                    <p className="text-2xl font-extrabold text-gradient">{s.value}</p>
                    <p className="text-xs font-medium text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-up" style={{ animationDelay: "0.12s" }}>
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/30 via-purple-500/20 to-cyan-400/30 blur-2xl" />
              <div className="card-glass relative animate-pulse-glow p-6 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-fuchsia-200/80">Örnek panel</span>
                  <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30">● Aktif</span>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: "QR", value: "12", color: "from-violet-400 to-fuchsia-500" },
                    { label: "Tarama", value: "840", color: "from-cyan-400 to-blue-500" },
                    { label: "Kredi", value: `${signupCredits}`, color: "from-orange-400 to-pink-500" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                      <div className={`mb-2 h-1 w-8 rounded-full bg-gradient-to-r ${s.color}`} />
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</p>
                      <p className="text-xl font-extrabold">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a0a2e] to-[#0c0118] p-5 shadow-inner">
                  <div className="mx-auto grid h-28 w-28 grid-cols-5 gap-1 p-2">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-sm ${[0, 1, 2, 4, 5, 6, 10, 12, 14, 18, 20, 22, 24].includes(i) ? "bg-gradient-to-br from-white to-fuchsia-200" : "bg-transparent"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-center text-xs font-medium text-fuchsia-200/70">Restoran menüsü · Dinamik QR</p>
                </div>
                <p className="mt-3 text-center text-[10px] text-slate-500">* Örnek arayüz — gerçek veriler panelinizde görünür</p>
              </div>
            </div>
          </div>
        </section>

        <HowItWorksSection />

        <section id="ozellikler" className="section-pad section-slate">
          <div className="site-container">
            <span className="section-badge">
              <Zap className="h-3.5 w-3.5" />
              Neden myQR?
            </span>
            <h2 className="section-title mt-4 text-[var(--ink)]">
              Teknik detaylarla uğraşmayın,{" "}
              <span className="text-gradient">işinize odaklanın</span>
            </h2>
            <p className="section-sub">
              Matbaa, ajans ve perakende işletmeleri için tasarlandı. QR üretin, müşterilerinize teslim edin, performansı gerçek zamanlı izleyin.
            </p>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ title, desc }, i) => {
                const theme = FEATURE_THEMES[i];
                return (
                  <article key={title} className="group card-glow card-hover relative overflow-hidden p-6">
                    <IconBadge icon={theme.icon} gradient={theme.gradient} glow={theme.glow} />
                    <h3 className="mt-4 text-lg font-bold text-[var(--ink)]">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{desc}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <UseCasesSection />

        <section className="section-pad border-y border-[var(--line)] bg-white">
          <div className="site-container max-w-4xl">
            <QrLifecyclePricing />
            <div className="mt-8 text-center">
              <Link href="/pricing" className="link-brand inline-flex items-center gap-1 text-sm">
                Tüm fiyatlandırma detayları <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="section-pad border-b border-[var(--line)] bg-white">
          <div className="site-container flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <span className="section-badge">
                <Users className="h-3.5 w-3.5" />
                İş ortağı programı
              </span>
              <h2 className="section-title mt-4 text-[var(--ink)]">
                Panel kiralayın,{" "}
                <span className="text-gradient">müşterilerinize satın</span>
              </h2>
              <p className="section-sub">
                myQR panelimizden çalışın: indirimli toptan kredi alın, her müşterinize ayrı panel açın,
                kendi fiyatınızla QR hizmeti sunun.
              </p>
            </div>
            <Link href="/panel-kiralama" className="btn-brand shrink-0 px-6 py-3.5">
              Panel kiralama detayları <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="section-pad section-dark">
          <div className="site-container">
            <div className="text-center">
              <span className="eyebrow-dark">Fiyatlandırma önizleme</span>
              <h2 className="section-title mt-4 text-white">İşletmenize uygun plan</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-400">
                Küçük atölyeden büyük ajansa — ihtiyacınıza göre ölçeklenen, şeffaf fiyatlandırma.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {previewPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} compact ctaLabel={launch ? "14 gün dene" : "Başla"} />
              ))}
            </div>
            <div className="mt-10 flex flex-col items-center gap-4">
              <PaymentBadges size="sm" variant="checkout" />
              <Link href="/pricing" className="link-brand inline-flex items-center gap-1 text-sm">
                Tüm paketleri ve kredi seçeneklerini gör <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="guvenlik" className="section-pad">
          <div className="site-container grid items-center gap-12 lg:grid-cols-2">
            <div>
              <IconBadge icon={Lock} gradient="from-slate-700 to-slate-900" size="lg" />
              <h2 className="section-title mt-6 text-[var(--ink)]">Verileriniz güvende</h2>
              <p className="section-sub">
                Kurumsal müşterilerin beklediği güvenlik standartları — altyapıdan uygulama katmanına kadar.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[var(--ink-muted)]">
                {[
                  "HTTP-only JWT oturum yönetimi",
                  "Tenant bazlı veri izolasyonu",
                  "API rate limiting",
                  "bcrypt ile şifre koruması",
                  "Korumalı uç noktalar",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-[var(--brand)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-glow p-8">
              <p className="font-bold text-[var(--ink)]">Şeffaf kredi modeli</p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">Ne kadar harcadığınızı her zaman bilin.</p>
              <div className="mt-4 grid gap-2">
                {[
                  { label: "Statik QR", val: "1 kredi" },
                  { label: "Dinamik QR", val: "3 kredi + süre" },
                  { label: "Kalıcı lisans", val: "150 kr ek" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between rounded-xl bg-[var(--surface-muted)] px-4 py-2.5 text-sm">
                    <span className="font-medium text-[var(--ink)]">{r.label}</span>
                    <span className="font-bold text-[var(--brand)]">{r.val}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="btn-brand mt-6 px-5 py-2.5">
                {launch ? LAUNCH.ctaPrimary : "Ücretsiz başla"}
              </Link>
            </div>
          </div>
        </section>

        <section id="iletisim" className="section-pad border-t border-[var(--line)] bg-white">
          <div className="site-container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="section-title text-[var(--ink)]">İletişim</h2>
              <p className="section-sub mx-auto">
                Sorularınız ve destek talepleriniz için bizimle iletişime geçin.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-3xl">
              <ContactInfoPanel />
            </div>
          </div>
        </section>

        <LaunchCtaSection />
      </main>

      <SiteFooter />
    </div>
  );
}
