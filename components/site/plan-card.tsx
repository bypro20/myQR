import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import type { PlanDefinition } from "@/lib/plans";
import { PLAN_THEMES } from "@/lib/marketing/theme";
import { IconBadge } from "@/components/site/icon-badge";
import { cn } from "@/lib/utils";

type Props = {
  plan: PlanDefinition;
  ctaHref?: string;
  ctaLabel?: string;
  compact?: boolean;
  isCurrent?: boolean;
  ctaExternal?: boolean;
  ctaOnClick?: () => void;
  ctaLoading?: boolean;
};

export function PlanCard({
  plan,
  ctaHref = "/signup",
  ctaLabel = "Başla",
  compact,
  isCurrent = false,
  ctaExternal = false,
  ctaOnClick,
  ctaLoading = false,
}: Props) {
  const theme = PLAN_THEMES[plan.id] ?? PLAN_THEMES.STARTER;

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border bg-white p-6 transition duration-300",
        isCurrent
          ? "border-emerald-300/70 shadow-[0_16px_40px_-12px_rgba(16,185,129,0.25)] ring-2 ring-emerald-400/35"
          : plan.highlight
          ? "border-fuchsia-300/60 shadow-[0_20px_50px_-15px_rgba(168,85,247,0.35)] ring-2 ring-fuchsia-400/40 scale-[1.03]"
          : "border-[var(--line)] shadow-md hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(124,58,237,0.2)]",
      )}
    >
      {isCurrent ? (
        <div className="absolute right-4 top-4 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
          Aktif
        </div>
      ) : plan.highlight ? (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg shadow-fuchsia-300/40">
          <Sparkles className="h-3 w-3" />
          Popüler
        </div>
      ) : null}

      <IconBadge icon={theme.icon} gradient={theme.gradient} glow={theme.glow} size="lg" />

      <h3 className={cn("mt-5 text-xl font-bold", theme.text)}>{plan.name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold tracking-tight text-gradient">{plan.priceTry}₺</span>
        <span className="text-sm text-[var(--ink-muted)]">/{plan.period}</span>
      </div>

      {!compact && (
        <ul className="mt-6 flex-1 space-y-3 text-sm">
          {[
            { ok: true, label: `${plan.creditsMonthly.toLocaleString("tr-TR")} kredi / ay` },
            { ok: true, label: `${plan.qrLimit ?? "Sınırsız"} QR limiti` },
            { ok: plan.dynamicQr, label: "Dinamik QR kodları" },
            { ok: plan.bulkExport, label: "Toplu CSV üretim" },
            { ok: plan.analytics, label: "Tarama analitiği" },
            { ok: plan.warrantyLcv, label: "Garanti & LCV modülleri" },
            { ok: plan.apiAccess, label: "API erişimi" },
            { ok: plan.whiteLabel, label: "White-label çıktılar" },
          ]
            .filter((f) => f.ok)
            .map((f) => (
              <li key={f.label} className="flex items-start gap-2.5 text-[var(--ink-muted)]">
                <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full", theme.soft)}>
                  <Check className={cn("h-3 w-3", theme.text)} strokeWidth={3} />
                </span>
                {f.label}
              </li>
            ))}
        </ul>
      )}

      <p className="mt-4 text-xs text-[var(--ink-muted)]">Destek: {plan.support}</p>

      {isCurrent ? (
        <span className="mt-6 block cursor-default rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-center text-sm font-bold text-emerald-800">
          Aktif planınız
        </span>
      ) : ctaOnClick ? (
        <button
          type="button"
          onClick={ctaOnClick}
          disabled={ctaLoading}
          className={cn(
            "mt-6 block w-full cursor-pointer rounded-xl py-3 text-center text-sm font-bold transition disabled:cursor-wait disabled:opacity-60",
            plan.highlight
              ? "btn-brand !flex justify-center"
              : "border border-[#e9d5ff] bg-gradient-to-b from-white to-[#faf5ff] text-[var(--ink)] hover:border-fuchsia-300 hover:shadow-md",
          )}
        >
          {ctaLoading ? "Yönlendiriliyor…" : ctaLabel}
        </button>
      ) : (
        <Link
          href={ctaHref}
          target={ctaExternal ? "_blank" : undefined}
          rel={ctaExternal ? "noopener noreferrer" : undefined}
          className={cn(
            "mt-6 block cursor-pointer rounded-xl py-3 text-center text-sm font-bold transition",
            plan.highlight
              ? "btn-brand !flex w-full justify-center"
              : "border border-[#e9d5ff] bg-gradient-to-b from-white to-[#faf5ff] text-[var(--ink)] hover:border-fuchsia-300 hover:shadow-md",
          )}
        >
          {ctaLabel}
        </Link>
      )}
    </article>
  );
}
