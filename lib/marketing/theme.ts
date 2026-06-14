import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Coins,
  Crown,
  CreditCard,
  Gem,
  Layers,
  QrCode,
  Rocket,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

export type IconTheme = {
  icon: LucideIcon;
  gradient: string;
  glow: string;
  text: string;
  soft: string;
};

const v = "from-violet-500 to-fuchsia-600";
const f = "from-fuchsia-500 to-pink-600";
const c = "from-cyan-400 to-blue-600";
const o = "from-orange-400 to-rose-500";
const i = "from-indigo-500 to-violet-700";

export const PLAN_THEMES: Record<string, IconTheme> = {
  FREE: { icon: Sparkles, gradient: "from-slate-500 to-slate-700", glow: "shadow-slate-200", text: "text-slate-700", soft: "bg-slate-100" },
  STARTER: { icon: Rocket, gradient: c, glow: "shadow-cyan-200", text: "text-cyan-700", soft: "bg-cyan-50" },
  PRO: { icon: Crown, gradient: v, glow: "shadow-violet-300", text: "text-violet-700", soft: "bg-violet-50" },
  BUSINESS: { icon: Building2, gradient: o, glow: "shadow-orange-200", text: "text-orange-700", soft: "bg-orange-50" },
};

export const CREDIT_THEMES: Record<string, IconTheme> = {
  pack_100: { icon: Coins, gradient: c, glow: "shadow-cyan-200", text: "text-cyan-700", soft: "bg-cyan-50" },
  pack_500: { icon: Gem, gradient: v, glow: "shadow-violet-200", text: "text-violet-700", soft: "bg-violet-50" },
  pack_1500: { icon: CreditCard, gradient: f, glow: "shadow-fuchsia-200", text: "text-fuchsia-700", soft: "bg-fuchsia-50" },
  pack_5000: { icon: Crown, gradient: i, glow: "shadow-indigo-200", text: "text-indigo-700", soft: "bg-indigo-50" },
};

export const FEATURE_THEMES: IconTheme[] = [
  { icon: QrCode, gradient: v, glow: "shadow-violet-200", text: "text-violet-700", soft: "bg-violet-50" },
  { icon: Zap, gradient: o, glow: "shadow-orange-200", text: "text-orange-700", soft: "bg-orange-50" },
  { icon: Layers, gradient: c, glow: "shadow-cyan-200", text: "text-cyan-700", soft: "bg-cyan-50" },
  { icon: BarChart3, gradient: f, glow: "shadow-fuchsia-200", text: "text-fuchsia-700", soft: "bg-fuchsia-50" },
  { icon: CreditCard, gradient: "from-emerald-400 to-teal-600", glow: "shadow-emerald-200", text: "text-emerald-700", soft: "bg-emerald-50" },
  { icon: Shield, gradient: i, glow: "shadow-indigo-200", text: "text-indigo-700", soft: "bg-indigo-50" },
];
