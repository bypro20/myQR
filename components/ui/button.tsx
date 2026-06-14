import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "border border-violet-500/30 bg-violet-600 text-white shadow-md shadow-violet-500/20 hover:bg-violet-700 active:bg-violet-800",
  secondary: "bg-white text-violet-900 border border-violet-200 hover:bg-violet-50",
  ghost: "border border-transparent text-violet-700 hover:bg-violet-50",
  accent: "border border-orange-400/30 bg-orange-500 text-white shadow-md shadow-orange-500/20 hover:bg-orange-600",
  danger: "border border-red-400/30 bg-red-500 text-white hover:bg-red-600",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
