import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const tones = {
  violet: "from-violet-500 to-violet-700 shadow-violet-500/20",
  orange: "from-orange-400 to-orange-600 shadow-orange-500/20",
  emerald: "from-emerald-400 to-emerald-600 shadow-emerald-500/20",
  sky: "from-sky-400 to-sky-600 shadow-sky-500/20",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "violet",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
}) {
  return (
    <div className="card-hover rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-violet-950">{value}</p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
