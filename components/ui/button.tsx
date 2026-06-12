import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "danger";

const variants: Record<Variant, string> = {
  primary: "gradient-brand text-white shadow-lg shadow-violet-500/25 hover:brightness-110",
  secondary: "bg-white text-violet-900 border border-violet-200 hover:bg-violet-50",
  ghost: "text-violet-700 hover:bg-violet-50",
  accent: "bg-orange-500 text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
