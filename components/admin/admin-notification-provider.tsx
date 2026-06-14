"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bell, CheckCircle2, Coins, ShoppingBag } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

type PaymentEvent = {
  id: string;
  kind: "created" | "claimed" | "completed";
  orderId: string;
  status: string;
  amountTry: number;
  credits: number;
  packageName: string;
  provider: string;
  message: string;
  createdAt: string;
  completedAt: string | null;
  customer: { name: string; email: string } | null;
  organization: { name: string; credits: number; unlimitedCredits: boolean };
};

type Stats = {
  pendingCount: number;
  pendingAmountTry: number;
  todayRevenueTry: number;
  todayOrderCount: number;
  todayCreditsSold: number;
  totalRevenueTry: number;
  totalCompletedOrders: number;
  totalCreditsSold: number;
  totalPlatformCredits: number;
  organizationCount: number;
  activeCustomers: number;
};

type Toast = { id: string; title: string; body: string; href: string };

type ActivityItem = {
  id: string;
  kind: string;
  kindLabel: string;
  category: string;
  message: string;
  createdAt: string;
  href?: string;
};

type Ctx = {
  pendingCount: number;
  stats: Stats | null;
  open: boolean;
  setOpen: (v: boolean) => void;
  events: PaymentEvent[];
  pending: PaymentEvent[];
  activities: ActivityItem[];
  canViewActivity: boolean;
  refresh: () => Promise<void>;
};

const AdminNotificationsContext = createContext<Ctx | null>(null);

function playNotifySound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    /* ignore */
  }
}

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const enabled = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [pending, setPending] = useState<PaymentEvent[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [canViewActivity, setCanViewActivity] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastPollRef = useRef<string>(new Date().toISOString());
  const seenIdsRef = useRef<Set<string>>(new Set());

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t.slice(-4), { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 8000);
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    const since = lastPollRef.current;
    const res = await fetch(`/api/admin/notifications?since=${encodeURIComponent(since)}`, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = await res.json();
    setEvents(data.events || []);
    setPending(data.pending || []);
    setActivities(data.activities || []);
    setCanViewActivity(!!data.canViewActivity);
    setStats(data.stats || null);
    lastPollRef.current = data.serverTime || new Date().toISOString();

    for (const ev of (data.newEvents || []) as PaymentEvent[]) {
      if (seenIdsRef.current.has(ev.id)) continue;
      seenIdsRef.current.add(ev.id);
      if (ev.kind === "claimed" || ev.kind === "completed") {
        playNotifySound();
        pushToast({
          title: ev.kind === "completed" ? "Satın alma tamamlandı" : "Yeni ödeme bildirimi",
          body: ev.message,
          href: "/admin/sales",
        });
      }
    }

    if (data.canViewActivity) {
      for (const act of (data.newActivities || []) as ActivityItem[]) {
        if (seenIdsRef.current.has(act.id)) continue;
        seenIdsRef.current.add(act.id);
        if (act.kind === "QR_CREATED" || act.kind === "SIGNUP" || act.kind === "USER_LOGIN" || act.kind === "ADMIN_LOGIN") {
          playNotifySound();
          pushToast({
            title: act.kindLabel,
            body: act.message,
            href: act.href || "/admin/activity",
          });
        }
      }
    }
  }, [enabled, pushToast]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const id = window.setInterval(() => void refresh(), 20_000);
    return () => window.clearInterval(id);
  }, [enabled, refresh]);

  const pendingCount = stats?.pendingCount ?? pending.length;

  return (
    <AdminNotificationsContext.Provider
      value={{ pendingCount, stats, open, setOpen, events, pending, activities, canViewActivity, refresh }}
    >
      {children}
      {enabled ? (
        <>
          <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2 sm:bottom-6 sm:right-6">
            {toasts.map((t) => (
              <Link
                key={t.id}
                href={t.href}
                className="pointer-events-auto flex max-w-sm gap-3 rounded-2xl border border-violet-200 bg-white p-4 shadow-xl shadow-violet-200/40 transition hover:scale-[1.02]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-orange-400 text-white">
                  <ShoppingBag className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-[var(--ink)]">{t.title}</span>
                  <span className="mt-0.5 block text-xs text-[var(--ink-muted)]">{t.body}</span>
                </span>
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  const ctx = useContext(AdminNotificationsContext);
  if (!ctx) throw new Error("useAdminNotifications outside provider");
  return ctx;
}

export function AdminNotificationBell() {
  const { pendingCount, open, setOpen, events, pending, activities, canViewActivity, stats } = useAdminNotifications();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "relative flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
          pendingCount > 0
            ? "border-orange-200 bg-orange-50 text-orange-900 hover:bg-orange-100"
            : "border-violet-200 bg-white text-violet-800 hover:bg-violet-50",
        )}
        aria-label="Satış bildirimleri"
      >
        <Bell className={cn("h-4 w-4", pendingCount > 0 && "animate-pulse")} />
        <span className="hidden sm:inline">Satışlar</span>
        {pendingCount > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,380px)] overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-2xl shadow-violet-200/30">
            <div className="border-b border-violet-50 bg-violet-50/60 px-4 py-3">
              <p className="text-sm font-bold text-[var(--ink)]">Satın Alma Bildirimleri</p>
              {stats ? (
                <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
                  Bugün ₺{stats.todayRevenueTry.toLocaleString("tr-TR")} · Bekleyen {stats.pendingCount} · Toplam bakiye{" "}
                  {stats.totalPlatformCredits.toLocaleString("tr-TR")} kredi
                </p>
              ) : null}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {pending.length > 0 ? (
                <div className="border-b border-violet-50 p-2">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">Onay bekleyen</p>
                  {pending.slice(0, 5).map((ev) => (
                    <div key={ev.orderId} className="rounded-xl px-3 py-2.5 text-sm hover:bg-orange-50/50">
                      <p className="font-semibold text-[var(--ink)]">{ev.customer?.name || ev.organization.name}</p>
                      <p className="text-xs text-[var(--ink-muted)]">
                        {ev.packageName} · ₺{ev.amountTry.toLocaleString("tr-TR")} · {ev.credits} kredi
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
              {canViewActivity
                ? activities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex gap-2 border-b border-violet-50 px-4 py-3 last:border-0">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500 text-white">
                    <Activity className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--ink)]">{act.message}</p>
                    <p className="text-[11px] text-[var(--ink-muted)]">{act.kindLabel} · {formatDate(act.createdAt)}</p>
                  </div>
                </div>
              ))
                : null}
              {events.slice(0, 8).map((ev) => (
                <div key={ev.id} className="flex gap-2 border-b border-violet-50 px-4 py-3 last:border-0">
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white",
                      ev.kind === "completed" ? "bg-emerald-500" : ev.kind === "claimed" ? "bg-orange-500" : "bg-violet-400",
                    )}
                  >
                    {ev.kind === "completed" ? <CheckCircle2 className="h-4 w-4" /> : <Coins className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--ink)]">{ev.message}</p>
                    <p className="text-[11px] text-[var(--ink-muted)]">{formatDate(ev.createdAt)}</p>
                  </div>
                </div>
              ))}
              {events.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[var(--ink-muted)]">Henüz bildirim yok.</p>
              ) : null}
            </div>
            <div className="border-t border-violet-50 p-3 grid gap-2">
              {canViewActivity ? (
              <Link
                href="/admin/activity"
                onClick={() => setOpen(false)}
                className="block rounded-xl border border-violet-200 py-2.5 text-center text-sm font-semibold text-violet-700 hover:bg-violet-50"
              >
                Canlı Aktivite →
              </Link>
              ) : null}
              <Link
                href="/admin/sales"
                onClick={() => setOpen(false)}
                className="block rounded-xl bg-violet-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-700"
              >
                Satış & Bakiye paneline git
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
