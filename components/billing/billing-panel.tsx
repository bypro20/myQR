"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Coins,
  CreditCard,
  Crown,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { getEffectivePlanTier } from "@/lib/billing/pricing-config";
import { CREDIT_PACKAGES } from "@/lib/billing/packages";
import { PLANS, getPlan, type PlanTier } from "@/lib/plans";
import { PLAN_THEMES } from "@/lib/marketing/theme";
import { CreditPackageCard } from "@/components/site/credit-package-card";
import { BillingConversion } from "@/components/analytics/billing-conversion";
import { QrLifecyclePricing } from "@/components/billing/qr-lifecycle-pricing";
import { IconBadge } from "@/components/site/icon-badge";
import { PlanCard } from "@/components/site/plan-card";
import { cn } from "@/lib/utils";

type Props = {
  organization: {
    id: string;
    name: string;
    planTier: string;
    credits: number;
    subscriptionStatus: string;
    trialEndsAt: string | null;
  };
  paymentNotice?: string;
  paymentMessage?: string;
};

type BillingTab = "credits" | "subscription";

const PAYMENT_NOTICES: Record<string, { tone: "success" | "error"; text: string }> = {
  success: { tone: "success", text: "Ödeme onaylandı, krediler hesabınıza yüklendi." },
  failed: { tone: "error", text: "Ödeme tamamlanamadı veya banka tarafından reddedildi." },
  cancelled: { tone: "error", text: "Ödeme iptal edildi." },
  awaiting: { tone: "success", text: "Ödeme bildiriminiz alındı. FAST transferi doğrulandıktan sonra kredi yüklenecek." },
  unconfigured: { tone: "error", text: "Ödeme altyapısı henüz yapılandırılmadı." },
};

const TABS: { id: BillingTab; label: string; short: string; icon: typeof Coins }[] = [
  { id: "credits", label: "Kredi Satın Al", short: "Tek seferlik paketler", icon: Coins },
  { id: "subscription", label: "Abonelik Planları", short: "Aylık planlar", icon: Layers },
];

function parseTab(value: string | null): BillingTab {
  return value === "subscription" ? "subscription" : "credits";
}

export function BillingPanel({ organization, paymentNotice, paymentMessage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<BillingTab>(() => parseTab(searchParams.get("tab")));
  const [showQrPricing, setShowQrPricing] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const effectiveTier = getEffectivePlanTier(organization);
  const plan = getPlan(effectiveTier);
  const planTheme = PLAN_THEMES[effectiveTier] ?? PLAN_THEMES.STARTER;
  const paidPlans = PLANS.filter((p) => p.id !== "FREE");

  useEffect(() => {
    setTab(parseTab(searchParams.get("tab")));
  }, [searchParams]);

  useEffect(() => {
    if (!paymentNotice) return;
    const preset = PAYMENT_NOTICES[paymentNotice];
    if (preset) {
      setMessageTone(preset.tone);
      setMessage(paymentMessage || preset.text);
      setTab("credits");
    }
    if (paymentNotice === "success") {
      router.refresh();
    }
  }, [paymentNotice, paymentMessage, router]);

  function selectTab(next: BillingTab) {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    router.replace(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
  }

  async function buy(packageId: string) {
    setLoading(packageId);
    setMessage("");
    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId }),
    });
    const data = await res.json();
    setLoading(null);

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }

    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
      return;
    }

    if (!res.ok) {
      setMessageTone("error");
      setMessage(
        data.error ||
          "Ödeme tamamlanmadan kredi yüklenmez. Lütfen ödeme adımını tamamlayın.",
      );
      return;
    }

    setMessageTone("success");
    setMessage("Ödeme onaylandı, krediler hesabınıza yüklendi.");
    router.refresh();
  }

  async function buyPlan(planId: PlanTier) {
    if (planId === "FREE") return;
    setLoading(planId);
    setMessage("");
    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
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
      setTab("subscription");
      return;
    }
  }

  return (
    <div className="space-y-6">
      <BillingConversion paymentNotice={paymentNotice} />

      {message ? (
        <p
          className={cn(
            "rounded-xl border px-4 py-3 text-sm font-medium",
            messageTone === "success"
              ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800"
              : "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900",
          )}
        >
          {message}
        </p>
      ) : null}

      <div className="inline-flex w-full max-w-xl rounded-2xl border border-violet-100 bg-violet-50/50 p-1.5 shadow-sm">
        {TABS.map(({ id, label, short, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectTab(id)}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition",
                active
                  ? id === "credits"
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-200/50"
                    : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-200/50"
                  : "text-slate-600 hover:bg-white/80 hover:text-violet-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{short}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <IconBadge icon={planTheme.icon} gradient={planTheme.gradient} glow={planTheme.glow} size="sm" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mevcut plan</p>
              <p className={cn("truncate text-lg font-bold", planTheme.text)}>{plan.name}</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <IconBadge icon={Coins} gradient="from-orange-400 to-rose-600" glow="shadow-orange-200" size="sm" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kredi bakiyesi</p>
              <p className="text-2xl font-extrabold text-orange-600">{organization.credits}</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <IconBadge icon={Crown} gradient="from-cyan-400 to-blue-600" glow="shadow-cyan-200" size="sm" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">QR limiti</p>
              <p className="text-lg font-bold text-slate-800">{plan.qrLimit ?? "Sınırsız"}</p>
            </div>
          </div>
        </article>
      </div>

      {tab === "credits" ? (
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-bold text-violet-950">Kredi paketi satın al</h2>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Abonelikten bağımsız, tek seferlik kredi yüklemesi. FAST veya havale ile ödeme.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800">
              <CreditCard className="h-3.5 w-3.5" />
              Anında QR üretimi
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {CREDIT_PACKAGES.map((pkg) => (
              <CreditPackageCard
                key={pkg.id}
                pkg={pkg}
                showButton
                loading={loading === pkg.id}
                onBuy={() => buy(pkg.id)}
              />
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white">
            <button
              type="button"
              onClick={() => setShowQrPricing((v) => !v)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left hover:bg-violet-50/40"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-violet-950">
                <Zap className="h-4 w-4 text-violet-600" />
                QR süre paketleri (referans)
              </div>
              <ChevronDown className={cn("h-5 w-5 text-violet-500 transition", showQrPricing && "rotate-180")} />
            </button>
            {showQrPricing ? (
              <div className="border-t border-violet-100 px-5 pb-5 pt-2">
                <QrLifecyclePricing showRenewNote hideHeader />
              </div>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-violet-600" />
              <h2 className="text-xl font-bold text-violet-950">Abonelik planları</h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Aylık planınız kredi limiti ve modül erişimini belirler. FAST veya havale ile anında yükseltin.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {paidPlans.map((p) => {
              const isCurrent = p.id === effectiveTier;
              return (
                <PlanCard
                  key={p.id}
                  plan={p}
                  isCurrent={isCurrent}
                  ctaOnClick={isCurrent ? undefined : () => buyPlan(p.id)}
                  ctaLoading={loading === p.id}
                  ctaLabel={isCurrent ? "Aktif planınız" : "Ödeme Yap"}
                />
              );
            })}
          </div>

          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-500">
            Hemen QR üretmek için{" "}
            <button
              type="button"
              onClick={() => selectTab("credits")}
              className="cursor-pointer font-semibold text-violet-600 underline-offset-2 hover:underline"
            >
              kredi paketi
            </button>{" "}
            satın alabilirsiniz — abonelik beklemeden devam edin.
          </p>
        </section>
      )}
    </div>
  );
}
