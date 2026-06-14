"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Coins,
  CreditCard,
  Layers,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { CreditPackageCard } from "@/components/site/credit-package-card";
import { PlanCard } from "@/components/site/plan-card";
import { PaymentBadges } from "@/components/site/payment-badges";
import { QrLifecyclePricing } from "@/components/billing/qr-lifecycle-pricing";
import { CREDIT_PACKAGES } from "@/lib/billing/packages";
import { PRICING } from "@/lib/billing/pricing-config";
import { PLANS, type PlanTier } from "@/lib/plans";
import { cn } from "@/lib/utils";

type PricingTab = "subscription" | "credits";

const compareRows = [
  { feature: "Dinamik QR", starter: true, pro: true, business: true },
  { feature: "Aylık QR lisansı dahil", starter: true, pro: true, business: true },
  { feature: "Toplu üretim", starter: false, pro: true, business: true },
  { feature: "Garanti / LCV", starter: false, pro: true, business: true },
  { feature: "QR süre paketleri", starter: true, pro: true, business: true },
  { feature: "API erişimi", starter: false, pro: false, business: true },
];

function parseTab(value: string | null): PricingTab {
  return value === "credits" ? "credits" : "subscription";
}

function loginRedirect(path: string) {
  return `/login?redirect=${encodeURIComponent(path)}`;
}

export function PricingStorefront() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<PricingTab>(() => parseTab(searchParams.get("tab")));
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("error");

  const plans = PLANS.filter((p) => p.id !== "FREE");

  useEffect(() => {
    setTab(parseTab(searchParams.get("tab")));
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/auth/login")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.authenticated)))
      .catch(() => setAuthed(false));
  }, []);

  const startCheckout = useCallback(
    async (payload: { packageId?: string; planId?: PlanTier }) => {
      const key = payload.packageId ?? payload.planId ?? "";
      setLoading(key);
      setMessage("");

      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLoading(null);

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (!res.ok) {
        setMessageTone("error");
        setMessage(data.error || "Ödeme başlatılamadı. Lütfen tekrar deneyin.");
        return;
      }
    },
    [],
  );

  useEffect(() => {
    if (authed !== true) return;

    const buy = searchParams.get("buy");
    const plan = searchParams.get("plan") as PlanTier | null;

    if (buy && CREDIT_PACKAGES.some((p) => p.id === buy)) {
      const url = new URL(window.location.href);
      url.searchParams.delete("buy");
      router.replace(url.pathname + url.search, { scroll: false });
      void startCheckout({ packageId: buy });
      return;
    }

    if (plan && plans.some((p) => p.id === plan)) {
      const url = new URL(window.location.href);
      url.searchParams.delete("plan");
      router.replace(url.pathname + url.search, { scroll: false });
      void startCheckout({ planId: plan });
    }
  }, [authed, searchParams, router, startCheckout, plans]);

  function selectTab(next: PricingTab) {
    setTab(next);
    setMessage("");
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    router.replace(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
  }

  function buyCredit(packageId: string) {
    if (authed === false) {
      window.location.href = loginRedirect(`/pricing?tab=credits&buy=${packageId}`);
      return;
    }
    if (authed) void startCheckout({ packageId });
  }

  function buyPlan(planId: PlanTier) {
    if (authed === false) {
      window.location.href = loginRedirect(`/pricing?tab=subscription&plan=${planId}`);
      return;
    }
    if (authed) void startCheckout({ planId });
  }

  return (
    <div className="space-y-0">
      {/* Tab bar */}
      <section className="sticky top-0 z-30 border-b border-[var(--line)] bg-white/90 backdrop-blur-md">
        <div className="site-container py-4">
          <div className="mx-auto flex max-w-2xl rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => selectTab("subscription")}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition",
                tab === "subscription"
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-200/50"
                  : "text-[var(--ink-muted)] hover:bg-white/80 hover:text-[var(--ink)]",
              )}
            >
              <Layers className="h-4 w-4 shrink-0" />
              <span>Abonelik Planları</span>
            </button>
            <button
              type="button"
              onClick={() => selectTab("credits")}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition",
                tab === "credits"
                  ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-200/50"
                  : "text-[var(--ink-muted)] hover:bg-white/80 hover:text-[var(--ink)]",
              )}
            >
              <Coins className="h-4 w-4 shrink-0" />
              <span>Kredi Paketleri</span>
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-[var(--ink-muted)]">
            {tab === "subscription"
              ? "Aylık plan — modül erişimi ve aylık kredi kotası"
              : "Tek seferlik kredi — abonelik gerekmez, süresiz geçerli"}
          </p>
        </div>
      </section>

      {message ? (
        <div className="site-container pt-6">
          <p
            className={cn(
              "rounded-xl border px-4 py-3 text-center text-sm font-medium",
              messageTone === "error"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-emerald-200 bg-emerald-50 text-emerald-800",
            )}
          >
            {message}
          </p>
        </div>
      ) : null}

      {tab === "subscription" ? (
        <>
          <section className="section-pad bg-white">
            <div className="site-container">
              <div className="mx-auto max-w-2xl text-center">
                <span className="eyebrow">
                  <Sparkles className="h-3.5 w-3.5" />
                  Aylık abonelik
                </span>
                <h2 className="section-title mt-3">Planınızı seçin, hemen başlayın</h2>
                <p className="section-sub mt-2">
                  Starter, Pro ve Business planları aylık faturalandırılır. Kart veya FAST ile anında abone olun.
                </p>
              </div>

              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    ctaLabel={authed === false ? "Giriş yap & abone ol" : "Abone ol"}
                    ctaOnClick={() => buyPlan(plan.id)}
                    ctaLoading={loading === plan.id}
                  />
                ))}
              </div>

              <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-4 text-xs text-[var(--ink-muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  Güvenli ödeme
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-violet-500" />
                  Kart · FAST · Troy
                </span>
                <span>İptal kolaylığı</span>
              </div>
            </div>
          </section>

          <section className="section-pad border-t border-[var(--line)] bg-[var(--surface-soft)]">
            <div className="site-container max-w-4xl">
              <h2 className="text-center text-2xl font-bold text-[var(--ink)]">Plan karşılaştırması</h2>
              <p className="mt-2 text-center text-sm text-[var(--ink-muted)]">
                Hangi planın size uygun olduğunu net şekilde görün.
              </p>
              <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm">
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

          <section className="border-t border-[var(--line)] bg-white py-10">
            <div className="site-container text-center">
              <p className="text-sm text-[var(--ink-muted)]">
                Abonelik istemiyor musunuz?{" "}
                <button
                  type="button"
                  onClick={() => selectTab("credits")}
                  className="cursor-pointer font-semibold text-orange-600 underline-offset-2 hover:underline"
                >
                  Kredi paketlerine geçin
                </button>
              </p>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="section-pad section-dark">
            <div className="site-container">
              <div className="mx-auto max-w-2xl text-center">
                <span className="eyebrow-dark">
                  <Zap className="h-3.5 w-3.5" />
                  Tek seferlik kredi
                </span>
                <h2 className="section-title mt-3 text-white">Kullandığınız kadar ödeyin</h2>
                <p className="section-sub mt-2 text-slate-400">
                  Abonelik gerekmez. Krediler süresiz geçerlidir — stok oluşturun, ihtiyaç oldukça harcayın.
                </p>
                <p className="mt-4 text-sm text-slate-500">
                  Statik QR <strong className="text-orange-400">{PRICING.creditCosts.staticQr}</strong> kr · Dinamik{" "}
                  <strong className="text-orange-400">{PRICING.creditCosts.dynamicQr}</strong> kr · Toplu satır{" "}
                  <strong className="text-orange-400">{PRICING.creditCosts.bulkRow}</strong> kr
                </p>
              </div>

              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {CREDIT_PACKAGES.map((pkg) => (
                  <CreditPackageCard
                    key={pkg.id}
                    pkg={pkg}
                    variant="dark"
                    showButton
                    ctaLabel={authed === false ? "Giriş yap & satın al" : "Satın al"}
                    loading={loading === pkg.id}
                    onBuy={() => buyCredit(pkg.id)}
                  />
                ))}
              </div>

              <div className="mt-10 flex flex-col items-center gap-3 border-t border-white/10 pt-10">
                <PaymentBadges size="sm" />
                <p className="text-center text-xs text-slate-500">
                  Kart, FAST ve Troy ·{" "}
                  <Link href="/mesafeli-satis-sozlesmesi" className="text-orange-400 hover:underline">
                    Mesafeli satış sözleşmesi
                  </Link>
                </p>
              </div>
            </div>
          </section>

          <section className="section-pad border-t border-[var(--line)] bg-white">
            <div className="site-container max-w-4xl">
              <span className="eyebrow">Kredi harcama rehberi</span>
              <p className="section-sub mt-3">
                Kredileriniz QR oluşturma ve süre uzatma için kullanılır. Aşağıdaki tablo referans fiyatlandırmadır.
              </p>
              <div className="mt-8">
                <QrLifecyclePricing />
              </div>
            </div>
          </section>

          <section className="border-t border-[var(--line)] bg-[var(--surface-soft)] py-10">
            <div className="site-container text-center">
              <p className="text-sm text-[var(--ink-muted)]">
                Sürekli kullanım için{" "}
                <button
                  type="button"
                  onClick={() => selectTab("subscription")}
                  className="cursor-pointer font-semibold text-violet-600 underline-offset-2 hover:underline"
                >
                  abonelik planlarına
                </button>{" "}
                göz atın — aylık kredi ve modül erişimi dahil.
              </p>
            </div>
          </section>
        </>
      )}

      {authed === false ? (
        <section className="border-t border-[var(--line)] bg-gradient-to-r from-violet-50 to-fuchsia-50 py-8">
          <div className="site-container flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
            <p className="text-sm text-[var(--ink-muted)]">Henüz hesabınız yok mu?</p>
            <Link href="/signup" className="btn-brand inline-flex items-center gap-2 px-6 py-2.5 text-sm">
              Ücretsiz hesap oluştur
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
