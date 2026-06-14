type Props = {
  className?: string;
  /** footer: iyzico + Visa + Mastercard band · checkout: iyzico ile öde yatay logo */
  variant?: "footer" | "checkout";
  size?: "sm" | "md";
};

const heights = { sm: "h-7", md: "h-8" } as const;

const sources = {
  footer: {
    src: "/payments/iyzico-footer-band.svg",
    alt: "iyzico ile Öde, Visa, Mastercard",
  },
  checkout: {
    src: "/payments/iyzico-checkout-horizontal.svg",
    alt: "iyzico ile Öde",
  },
} as const;

export function PaymentBadges({ className = "", variant = "footer", size = "md" }: Props) {
  const { src, alt } = sources[variant];
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
