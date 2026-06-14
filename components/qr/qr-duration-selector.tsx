"use client";

import { Clock, Crown, Infinity, Sparkles } from "lucide-react";
import type { QrDurationTier } from "@/app/generated/prisma/client";
import {
  type DurationTierDef,
  qrBaseCost,
  qrTotalCreationCost,
  tierExtraCredits,
} from "@/lib/qr/duration";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type OrgPricing = {
  planTier: string;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  credits: number;
  unlimitedCredits: boolean;
};

type Props = {
  tiers: DurationTierDef[];
  selected: QrDurationTier;
  onSelect: (tier: QrDurationTier) => void;
  mode: "STATIC" | "DYNAMIC";
  org: OrgPricing;
};

export function QrDurationSelector({ tiers, selected, onSelect, mode, org }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-violet-600" />
        <h3 className="font-semibold text-violet-950">QR Süresi & Lisans</h3>
      </div>
      <p className="text-sm text-slate-500">
        Profesyonel QR platformları gibi: ücretsiz deneme süresi biter bitmez tarama durur. Devam için kredi paketi
        veya abonelik gerekir. <strong>Kalıcı</strong> seçeneği matbaa baskısı için idealdir.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {tiers.map((tier) => {
          const total = qrTotalCreationCost(mode, tier.id, org);
          const extra = tierExtraCredits(tier.id, org);
          const included = extra === 0 && tier.id !== "FREE_TRIAL";
          const active = selected === tier.id;
          const affordable = org.unlimitedCredits || org.credits >= total;
          return (
            <button
              key={tier.id}
              type="button"
              disabled={!affordable}
              onClick={() => onSelect(tier.id)}
              className={cn(
                "relative rounded-2xl border p-4 text-left transition",
                active
                  ? "border-violet-500 bg-violet-50 ring-2 ring-violet-300"
                  : affordable
                    ? "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/50"
                    : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-violet-950">{tier.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{tier.description}</p>
                </div>
                {tier.id === "PERMANENT" ? (
                  <Infinity className="h-5 w-5 shrink-0 text-amber-600" />
                ) : tier.id === "FREE_TRIAL" ? (
                  <Sparkles className="h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <Crown className="h-5 w-5 shrink-0 text-violet-500" />
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {tier.badge ? <Badge variant={tier.id === "FREE_TRIAL" ? "success" : "accent"}>{tier.badge}</Badge> : null}
                {tier.recommended ? <Badge variant="warning">Popüler</Badge> : null}
                {included ? <Badge variant="success">Abonelikte dahil</Badge> : null}
                <span className="text-xs font-bold text-violet-700">
                  {included
                    ? `${tier.shortLabel} · dahil`
                    : tier.id === "FREE_TRIAL"
                      ? `${tier.days} gün · ${total} kr`
                      : tier.days
                        ? `${tier.shortLabel} · ${total} kr`
                        : `Süresiz · ${total} kr`}
                </span>
                {!affordable ? <span className="text-[10px] font-semibold text-red-600">Yetersiz kredi</span> : null}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-400">
        Oluşturma: {qrBaseCost(mode)} kr taban + süre lisansı. Bakiye: {org.unlimitedCredits ? "∞" : org.credits} kr
      </p>
    </div>
  );
}
