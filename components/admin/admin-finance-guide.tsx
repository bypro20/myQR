"use client";

import { Bell, Coins, CreditCard, Landmark, Layers, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const GUIDE_ITEMS = [
  {
    icon: Landmark,
    tone: "from-orange-500 to-amber-500",
    title: "FAST Onay Kuyruğu",
    body: "Müşteri ödeme sayfasında «FAST yaptım — bildir» dediğinde buraya düşer. Bankadan transferi kontrol edip Onayla.",
  },
  {
    icon: Layers,
    tone: "from-violet-500 to-fuchsia-500",
    title: "Abonelik Yükseltmeleri",
    body: "Starter / Pro / Business planları. Onay sonrası plan otomatik aktif olur ve ilk ay kredisi yüklenir.",
  },
  {
    icon: Coins,
    tone: "from-sky-500 to-cyan-500",
    title: "Kredi Paketleri",
    body: "Tek seferlik kredi satın alımları. Onay sonrası bakiye anında artar; abonelikten bağımsızdır.",
  },
  {
    icon: CreditCard,
    tone: "from-emerald-500 to-teal-500",
    title: "Kart Ödemeleri",
    body: "Iyzico veya Posnet ile yapılan ödemeler otomatik tamamlanır; bu panelde sadece FAST onayı gerekir.",
  },
] as const;

export function AdminFinanceGuide({ fastClaimedCount = 0 }: { fastClaimedCount?: number }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 via-white to-orange-50/40 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-600">Finans merkezi</p>
          <h2 className="mt-1 text-xl font-bold text-[var(--ink)]">Ödemeler nasıl işlenir?</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
            Müşteri panelinden gelen tüm ödemeler bu sayfada toplanır. FAST bildirimleri anında admin paneline düşer;
            abonelik ve kredi işlemlerini aşağıdaki bölümlerden takip edin.
          </p>
        </div>
        {fastClaimedCount > 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-900">
            <Bell className="h-4 w-4 animate-pulse" />
            {fastClaimedCount} FAST bildirimi onay bekliyor
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4" />
            FAST kuyruğu temiz
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {GUIDE_ITEMS.map(({ icon: Icon, tone, title, body }) => (
          <article
            key={title}
            className="rounded-xl border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm"
          >
            <span
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md",
                tone,
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <h3 className="mt-3 text-sm font-bold text-[var(--ink)]">{title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-muted)]">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
