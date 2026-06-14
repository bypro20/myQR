import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  gradient: string;
  glow?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: { box: "h-9 w-9 rounded-lg", icon: "h-4 w-4" },
  md: { box: "h-12 w-12 rounded-xl", icon: "h-6 w-6" },
  lg: { box: "h-14 w-14 rounded-2xl", icon: "h-7 w-7" },
  xl: { box: "h-16 w-16 rounded-2xl", icon: "h-8 w-8" },
};

export function IconBadge({ icon: Icon, gradient, glow, size = "md", className }: Props) {
  const s = sizes[size];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br text-white shadow-lg",
        s.box,
        glow,
        className,
        gradient,
      )}
    >
      <Icon className={s.icon} strokeWidth={2.2} />
    </div>
  );
}
