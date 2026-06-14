import Link from "next/link";
import { ArrowRight, Coins, QrCode, RefreshCw } from "lucide-react";
import { PRICING } from "@/lib/billing/pricing-config";

const steps = [
  {
    icon: QrCode,
    step: "1",
    title: "Ücretsiz başlayın",
    desc: `${PRICING.trialDays} gün Pro denemesi, dinamik QR ve analitik. İlk QR'ınızı dakikalar içinde oluşturun.`,
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: Coins,
    step: "2",
    title: "Müşterinize satın",
    desc: "Matbaa, menü, kartvizit veya kampanya QR'ı üretin. Toplu CSV/ZIP ile yüzlerce kodu tek seferde teslim edin.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: RefreshCw,
    step: "3",
    title: "Yenileme geliri",
    desc: `${PRICING.freeQrTrialDays} gün deneme sonrası süre uzatma veya kalıcı lisans — sektör standardı gelir modeli.`,
    gradient: "from-orange-500 to-rose-500",
  },
];

export function HowItWorksSection() {
  return (
    <section className="section-pad border-y border-[var(--line)] bg-white">
      <div className="site-container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-badge">Nasıl çalışır?</span>
          <h2 className="section-title mt-4 text-[var(--ink)]">
            Deneyin, satın,{" "}
            <span className="text-gradient">yenileme geliri elde edin</span>
          </h2>
          <p className="section-sub mx-auto">
            QR Code Generator ve Bitly gibi profesyonel platformların gelir modeli — siz de müşterilerinize aynı deneyimi sunun.
          </p>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map(({ icon: Icon, step, title, desc, gradient }) => (
            <article key={step} className="relative card-glow p-6">
              <span className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-extrabold text-white shadow-lg">
                {step}
              </span>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-[var(--ink)]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">{desc}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/signup" className="btn-brand inline-flex px-6 py-3">
            Ücretsiz hesap aç <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
