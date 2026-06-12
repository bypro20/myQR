import { cn } from "@/lib/utils";

const styles = {
  default: "bg-violet-100 text-violet-800",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-700",
  muted: "bg-slate-100 text-slate-600",
  accent: "bg-orange-100 text-orange-800",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof styles;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", styles[variant], className)}>
      {children}
    </span>
  );
}
