import Link from "next/link";
import type { CreditPackage } from "@/lib/billing/packages";
import { CREDIT_THEMES } from "@/lib/marketing/theme";
import { IconBadge } from "@/components/site/icon-badge";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";

type Props = {
  pkg: CreditPackage;
  onBuy?: () => void;
  loading?: boolean;
  showButton?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  variant?: "light" | "dark";
};

export function CreditPackageCard({
  pkg,
  onBuy,
  loading,
  showButton = false,
  ctaLabel = "Satın al",
  ctaHref,
  variant = "light",
}: Props) {
  const theme = CREDIT_THEMES[pkg.id] ?? CREDIT_THEMES.pack_100;
  const total = pkg.credits + pkg.bonus;
  const dark = variant === "dark";

  const buttonClass = cn(
    "mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-wait disabled:opacity-60",
    `bg-gradient-to-r ${theme.gradient}`,
  );

  return (
    <article
      className={cn(
        "relative flex flex-col rounded-2xl border p-5 transition duration-300",
        dark
          ? pkg.popular
            ? "border-fuchsia-400/40 bg-white/10 shadow-[0_16px_40px_-10px_rgba(236,72,153,0.35)] ring-2 ring-fuchsia-400/30"
            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]"
          : pkg.popular
            ? "border-fuchsia-300/60 bg-white shadow-[0_16px_40px_-10px_rgba(236,72,153,0.35)] ring-2 ring-fuchsia-400/40"
            : "border-[var(--line)] bg-white shadow-md hover:-translate-y-1 hover:shadow-[0_12px_32px_-10px_rgba(124,58,237,0.2)]",
      )}
    >
      {pkg.popular && (
        <span className="absolute -top-2.5 right-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white shadow-lg">
          <Sparkles className="h-3 w-3" />
          Favori
        </span>
      )}

      <IconBadge icon={theme.icon} gradient={theme.gradient} glow={theme.glow} size="md" />

      <h3 className={cn("mt-4 font-bold", dark ? "text-white" : theme.text)}>{pkg.name}</h3>
      <p className="mt-1 text-3xl font-extrabold text-gradient">{pkg.priceTry}₺</p>

      <div
        className={cn(
          "mt-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
          dark ? "bg-white/10 text-orange-200" : theme.soft,
          !dark && theme.text,
        )}
      >
        {total.toLocaleString("tr-TR")} kredi
        {pkg.bonus > 0 && <span className="opacity-80">(+{pkg.bonus} bonus)</span>}
      </div>

      {pkg.tagline ? (
        <p className={cn("mt-2 text-xs", dark ? "text-slate-400" : "text-[var(--ink-muted)]")}>{pkg.tagline}</p>
      ) : null}

      {showButton && onBuy ? (
        <button type="button" onClick={onBuy} disabled={loading} className={buttonClass}>
          {loading ? "Ödemeye yönlendiriliyor…" : ctaLabel}
          {!loading ? <ArrowRight className="h-3.5 w-3.5" /> : null}
        </button>
      ) : null}

      {showButton && !onBuy && ctaHref ? (
        <Link href={ctaHref} className={buttonClass}>
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </article>
  );
}
