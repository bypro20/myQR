"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
  className?: string;
  frame?: "hero" | "showcase" | "card" | "wide";
  align?: "left" | "right" | "center";
  expandable?: boolean;
  href?: string;
  /** Lightbox içinde detay linki; altyazıda gösterme (sayfada ayrı CTA varsa false) */
  showCaptionLink?: boolean;
};

export function MarketingVisual({
  src,
  alt,
  caption,
  priority = false,
  className,
  frame = "showcase",
  align = "center",
  expandable = true,
  href,
  showCaptionLink = false,
}: Props) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const frameClass =
    frame === "hero"
      ? "rounded-[1.75rem] shadow-[0_32px_80px_-24px_rgba(124,58,237,0.45)]"
      : frame === "wide"
        ? "rounded-3xl shadow-[0_24px_60px_-20px_rgba(15,23,42,0.25)]"
        : frame === "card"
          ? "rounded-2xl shadow-xl shadow-violet-200/40"
          : "rounded-[1.5rem] shadow-[0_28px_70px_-28px_rgba(168,85,247,0.35)]";

  const useContain = frame === "showcase" || frame === "wide" || frame === "card";

  function openLightbox() {
    if (expandable) setOpen(true);
  }

  const imageBlock = (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden border border-white/20 bg-gradient-to-br from-slate-50 to-white p-2 sm:p-3",
        frameClass,
        expandable && "cursor-zoom-in",
      )}
      onClick={expandable ? openLightbox : undefined}
      onKeyDown={
        expandable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openLightbox();
              }
            }
          : undefined
      }
      role={expandable ? "button" : undefined}
      tabIndex={expandable ? 0 : undefined}
      aria-label={expandable ? `${alt} — tam boyutta görüntüle` : undefined}
    >
      <Image
        src={src}
        alt={alt}
        width={frame === "hero" ? 900 : 1200}
        height={frame === "hero" ? 1100 : 1600}
        priority={priority}
        className={cn(
          "mx-auto block h-auto w-auto max-w-full transition duration-700",
          useContain ? "object-contain" : "object-cover object-center",
          expandable && "group-hover:scale-[1.01]",
          frame === "hero" && "max-h-[min(72vh,640px)]",
          frame === "wide" && "max-h-[min(56vh,440px)]",
          frame === "showcase" && "max-h-[min(50vh,380px)] sm:max-h-[420px]",
          frame === "card" && "max-h-[320px]",
        )}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
      />
      {expandable ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/10 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-slate-800 shadow-lg">
            <ZoomIn className="h-3.5 w-3.5" />
            Tam görüntüle
          </span>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0118]/20 via-transparent to-transparent" />
      )}
    </div>
  );

  return (
    <>
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
        {href && !expandable ? (
          <Link href={href} className="block">
            {imageBlock}
          </Link>
        ) : (
          imageBlock
        )}
        {caption ? (
          <figcaption className="mt-3 text-center text-sm font-medium text-slate-400">
            {caption}
            {href && showCaptionLink ? (
              <>
                {" "}
                <Link href={href} className="text-[var(--brand)] hover:underline">
                  Detayları gör →
                </Link>
              </>
            ) : null}
          </figcaption>
        ) : null}
      </figure>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/92 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <p className="truncate text-sm font-medium text-white/80">{alt}</p>
            <div className="flex items-center gap-2">
              {href ? (
                <Link
                  href={href}
                  className="btn-brand hidden px-4 py-2 text-sm sm:inline-flex"
                  onClick={close}
                >
                  Detayları gör
                </Link>
              ) : null}
              <button
                type="button"
                onClick={close}
                className="rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div
            className="flex flex-1 items-center justify-center overflow-auto p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              width={1400}
              height={2000}
              className="h-auto max-h-full w-auto max-w-full rounded-xl object-contain shadow-2xl"
              sizes="95vw"
              priority
            />
          </div>
          {href ? (
            <div className="shrink-0 border-t border-white/10 p-4 text-center sm:hidden">
              <Link href={href} className="btn-brand inline-flex w-full max-w-xs justify-center px-6 py-3" onClick={close}>
                Detayları gör
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

type SplitProps = {
  image: string;
  alt: string;
  caption?: string;
  reverse?: boolean;
  children: React.ReactNode;
  className?: string;
  href?: string;
};

/** Metin + görsel yan yana bölüm */
export function MarketingSplitSection({
  image,
  alt,
  caption,
  reverse = false,
  children,
  className,
  href,
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
        <MarketingVisual
          src={image}
          alt={alt}
          caption={caption}
          frame="showcase"
          align={reverse ? "left" : "right"}
          href={href}
        />
      </div>
    </section>
  );
}
