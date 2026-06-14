type Props = {
  className?: string;
  /** footer: geniş bant · checkout: kompakt */
  variant?: "footer" | "checkout";
  size?: "sm" | "md";
  /** Kart (iyzico) rozeti — yapılandırılmadıysa false bırakın */
  showCard?: boolean;
};

const heights = { sm: "h-7", md: "h-8" } as const;

function FastBadges({ size }: { size: "sm" | "md" }) {
  const text = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5" aria-label="FAST, havale ve güvenli ödeme">
      <span className={`rounded-full border border-emerald-200 bg-emerald-50 font-bold uppercase tracking-wide text-emerald-800 ${text}`}>
        FAST
      </span>
      <span className={`rounded-full border border-sky-200 bg-sky-50 font-bold uppercase tracking-wide text-sky-800 ${text}`}>
        Havale
      </span>
      <span className={`rounded-full border border-violet-200 bg-violet-50 font-bold uppercase tracking-wide text-violet-800 ${text}`}>
        Troy
      </span>
      <span className={`rounded-full border border-slate-200 bg-slate-50 font-bold uppercase tracking-wide text-slate-700 ${text}`}>
        SSL
      </span>
    </div>
  );
}

const cardSources = {
  footer: {
    src: "/payments/iyzico-footer-band.svg",
    alt: "iyzico ile Öde, Visa, Mastercard",
  },
  checkout: {
    src: "/payments/iyzico-checkout-horizontal.svg",
    alt: "iyzico ile Öde",
  },
} as const;

export function PaymentBadges({
  className = "",
  variant = "footer",
  size = "md",
  showCard = false,
}: Props) {
  if (!showCard) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <FastBadges size={size} />
      </div>
    );
  }

  const { src, alt } = cardSources[variant];
  const h = heights[size];

  return (
    <div className={`flex items-center justify-center ${className}`} aria-label={alt}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`${h} w-auto max-w-[min(100%,20rem)] shrink-0 object-contain object-left`}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
