import { cn } from "@/lib/utils";

type Props = {
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
  align?: "center" | "left";
  size?: "default" | "compact";
};

export function PageHero({ badge, title, subtitle, children, align = "center", size = "default" }: Props) {
  return (
    <section className="page-hero relative overflow-hidden border-b border-white/10">
      <div className="aurora">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
      </div>
      <div className="site-grid-bg absolute inset-0 opacity-[0.08]" />
      <div
        className={cn(
          "site-container relative",
          size === "compact" ? "py-16 lg:py-20" : "py-20 lg:py-28",
          align === "center" && "text-center",
        )}
      >
        {badge ? <div className={cn(align === "center" && "flex justify-center")}>{badge}</div> : null}
        <h1
          className={cn(
            "mt-6 font-extrabold tracking-tight text-balance text-white",
            size === "compact" ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.08]",
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={cn(
              "mt-5 text-lg leading-relaxed text-slate-300/90",
              align === "center" ? "mx-auto max-w-2xl" : "max-w-xl",
            )}
          >
            {subtitle}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
