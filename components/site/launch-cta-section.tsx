import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { signupOfferLine, isLaunchActive, LAUNCH } from "@/lib/marketing/launch-config";
import { PRICING } from "@/lib/billing/pricing-config";

export function LaunchCtaSection() {
  const launch = isLaunchActive();

  return (
    <section className="section-pad section-mesh">
      <div className="site-container">
        <div className="mx-auto max-w-3xl rounded-3xl border border-violet-200/80 bg-gradient-to-br from-white via-violet-50/50 to-fuchsia-50/30 p-8 text-center shadow-xl shadow-violet-200/30 sm:p-12">
          {launch ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
              {LAUNCH.label}
            </span>
          ) : null}
          <h2 className="section-title mt-4 text-[var(--ink)] text-balance">
            İlk QR kodunuzu{" "}
            <span className="text-gradient-warm">dakikalar içinde</span> oluşturun
          </h2>
          <p className="section-sub mx-auto mt-3">{signupOfferLine()} · kredi kartı gerekmez.</p>
          <ul className="mx-auto mt-6 flex max-w-md flex-col gap-2 text-left text-sm text-[var(--ink-muted)] sm:mx-auto sm:max-w-lg">
            {[
              `${PRICING.freeQrTrialDays} gün dinamik QR denemesi (sonra süre uzatma)`,
              "45+ format: menü, Wi-Fi, vCard, garanti, LCV",
              "FAST / kart ile kredi yükleme · abonelikte aylık QR dahil",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--brand)]" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="btn-brand btn-brand-lg">
              {launch ? LAUNCH.ctaPrimary : "Hemen ücretsiz başla"} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="btn-outline px-6 py-3">
              Fiyatları gör
            </Link>
          </div>
          <p className="mt-4 text-sm text-[var(--ink-muted)]">
            Bayi / panel kiralama mı?{" "}
            <Link href="/panel-kiralama" className="link-brand">
              İş ortağı programı →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
