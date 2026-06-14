import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
  className?: string;
  frame?: "hero" | "showcase" | "card" | "wide";
  align?: "left" | "right" | "center";
};

export function MarketingVisual({
  src,
  alt,
  caption,
  priority = false,
  className,
  frame = "showcase",
  align = "center",
}: Props) {
  const frameClass =
    frame === "hero"
      ? "rounded-[1.75rem] shadow-[0_32px_80px_-24px_rgba(124,58,237,0.45)]"
      : frame === "wide"
        ? "rounded-3xl shadow-[0_24px_60px_-20px_rgba(15,23,42,0.25)]"
        : frame === "card"
          ? "rounded-2xl shadow-xl shadow-violet-200/40"
          : "rounded-[1.5rem] shadow-[0_28px_70px_-28px_rgba(168,85,247,0.35)]";

  return (
    <figure
      className={cn(
        "group relative",
        align === "center" && "mx-auto",
        align === "right" && "ml-auto",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/25 via-violet-500/15 to-cyan-400/20 opacity-80 blur-2xl transition duration-500 group-hover:opacity-100",
          frame === "hero" && "-inset-4",
        )}
        aria-hidden
      />
      <div className={cn("relative overflow-hidden border border-white/20 bg-white/5", frameClass)}>
        <Image
          src={src}
          alt={alt}
          width={frame === "hero" ? 900 : 1200}
          height={frame === "hero" ? 1100 : 800}
          priority={priority}
          className={cn(
            "h-auto w-full object-cover transition duration-700 group-hover:scale-[1.02]",
            frame === "hero" && "max-h-[min(78vh,720px)]",
            frame === "wide" && "max-h-[520px]",
            frame === "showcase" && "max-h-[480px]",
            frame === "card" && "max-h-[360px]",
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0118]/35 via-transparent to-transparent" />
      </div>
      {caption ? (
        <figcaption className="mt-4 text-center text-sm font-medium text-slate-400">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

type SplitProps = {
  image: string;
  alt: string;
  caption?: string;
  reverse?: boolean;
  children: React.ReactNode;
  className?: string;
};

/** Metin + görsel yan yana bölüm */
export function MarketingSplitSection({
  image,
  alt,
  caption,
  reverse = false,
  children,
  className,
}: SplitProps) {
  return (
    <section className={cn("section-pad", className)}>
      <div
        className={cn(
          "site-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16",
          reverse && "lg:[&>*:first-child]:order-2",
        )}
      >
        <div>{children}</div>
        <MarketingVisual src={image} alt={alt} caption={caption} frame="showcase" align={reverse ? "left" : "right"} />
      </div>
    </section>
  );
}
