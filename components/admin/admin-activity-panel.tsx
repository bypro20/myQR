"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Building2,
  Coins,
  CreditCard,
  LogIn,
  QrCode,
  Radio,
  RefreshCw,
  ShoppingBag,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { formatDate } from "@/lib/utils";
import type { ActivityFeedItem } from "@/lib/admin/activity-log";

type ActiveUser = { id: string; name: string; email: string; role: string; lastLoginAt: string | null };
type Stats = { todayEvents: number; todayQrCreated: number; todayPayments: number; activeUsersCount: number };

const CATEGORY_LABEL: Record<string, string> = {
  qr: "QR",
  auth: "Giriş",
  payment: "Ödeme",
  credit: "Kredi",
  user: "Kullanıcı",
  org: "Organizasyon",
  admin: "Admin",
  system: "Sistem",
};

const CATEGORY_VARIANT: Record<string, "success" | "warning" | "accent" | "muted" | "danger"> = {
  qr: "success",
  auth: "accent",
  payment: "warning",
  credit: "muted",
  user: "accent",
  org: "muted",
  admin: "danger",
  system: "muted",
};

const FILTER_OPTIONS = [
  { value: "ALL", label: "Tümü" },
  { value: "QR_CREATED", label: "QR Oluşturma" },
  { value: "ADMIN_LOGIN", label: "Admin Girişi" },
  { value: "USER_LOGIN", label: "Kullanıcı Girişi" },
  { value: "SIGNUP", label: "Kayıt" },
  { value: "PAYMENT_CREATED", label: "Ödeme Talebi" },
  { value: "PAYMENT_APPROVED", label: "Ödeme Onayı" },
  { value: "CREDIT_ADJUSTED", label: "Kredi İşlemi" },
] as const;

function CategoryIcon({ category }: { category: string }) {
  if (category === "qr") return <QrCode className="h-4 w-4" />;
  if (category === "auth") return <LogIn className="h-4 w-4" />;
  if (category === "payment") return <ShoppingBag className="h-4 w-4" />;
  if (category === "credit") return <Coins className="h-4 w-4" />;
  if (category === "user") return <Users className="h-4 w-4" />;
  if (category === "org") return <Building2 className="h-4 w-4" />;
  if (category === "admin") return <Activity className="h-4 w-4" />;
  return <Radio className="h-4 w-4" />;
}

export function AdminActivityPanel() {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(true);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ limit: "100" });
    if (filter !== "ALL") params.set("kind", filter);
    const res = await fetch(`/api/admin/activity?${params}`, { cache: "no-store" });
    const data = await res.json();
    if (res.ok) {
      setActivities(data.activities || []);
      setActiveUsers(data.activeUsers || []);
      setStats(data.stats || null);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(id);
  }, [live, load]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return activities;
    return activities.filter((a) => a.kind === filter);
  }, [activities, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Canlı Aktivite"
        description="Platformdaki tüm işlemler: kim QR üretti, kim giriş yaptı, kim ödeme yaptı — anlık takip"
        action={
          <div className="flex gap-2">
            <Button type="button" variant={live ? "accent" : "secondary"} className="text-xs" onClick={() => setLive((v) => !v)}>
              <Radio className="h-3.5 w-3.5" />
              {live ? "Canlı" : "Duraklatıldı"}
            </Button>
            <Button type="button" variant="secondary" className="text-xs" onClick={() => void load()}>
              <RefreshCw className="h-3.5 w-3.5" />
              Yenile
            </Button>
          </div>
        }
      />

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Bugünkü Olay" value={stats.todayEvents} icon={Activity} tone="violet" />
          <StatCard label="Bugün QR" value={stats.todayQrCreated} icon={QrCode} tone="emerald" />
          <StatCard label="Bugün Ödeme" value={stats.todayPayments} icon={CreditCard} tone="orange" />
          <StatCard label="Son 1 Saat Aktif" value={stats.activeUsersCount} icon={Users} tone="sky" />
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--ink)]">
              <Radio className="h-5 w-5 text-rose-500" />
              İşlem Akışı
              {live ? <span className="ml-1 inline-flex h-2 w-2 animate-pulse rounded-full bg-rose-500" /> : null}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                    filter === f.value ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-700 hover:bg-violet-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardBody className="max-h-[640px] space-y-0 overflow-y-auto p-0">
            {loading ? (
              <p className="px-6 py-12 text-center text-[var(--ink-muted)]">Yükleniyor…</p>
            ) : filtered.length === 0 ? (
              <p className="px-6 py-12 text-center text-[var(--ink-muted)]">Henüz aktivite kaydı yok.</p>
            ) : (
              filtered.map((item) => (
                <div key={item.id} className="flex gap-3 border-t border-violet-50 px-6 py-4 first:border-t-0">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <CategoryIcon category={item.category} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={CATEGORY_VARIANT[item.category] || "muted"}>{CATEGORY_LABEL[item.category] || item.category}</Badge>
                      <span className="text-[11px] font-semibold text-[var(--ink-muted)]">{item.kindLabel}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-[var(--ink)]">{item.message}</p>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[var(--ink-muted)]">
                      {item.actor ? (
                        <span>
                          <strong className="text-violet-700">{item.actor.name}</strong>
                          {item.actor.email ? ` · ${item.actor.email}` : ""}
                          {item.actor.role ? ` · ${item.actor.role}` : ""}
                        </span>
                      ) : (
                        <span>Sistem</span>
                      )}
                      {item.organization ? <span>Org: {item.organization.name}</span> : null}
                      {item.targetLabel ? <span>Hedef: {item.targetLabel}</span> : null}
                    </div>
                    <p className="mt-1 text-[10px] text-[var(--ink-muted)]">{formatDate(item.createdAt)}</p>
                  </div>
                  {item.href ? (
                    <Link href={item.href} className="shrink-0 self-start text-xs font-semibold text-violet-600 hover:underline">
                      Detay →
                    </Link>
                  ) : null}
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card className="border-emerald-200/60">
            <CardHeader className="bg-emerald-50/40">
              <h2 className="flex items-center gap-2 font-semibold text-[var(--ink)]">
                <Users className="h-5 w-5 text-emerald-600" />
                Son Aktif Kullanıcılar
              </h2>
            </CardHeader>
            <CardBody className="space-y-0 p-0">
              {activeUsers.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-[var(--ink-muted)]">Son 1 saatte aktif kullanıcı yok.</p>
              ) : (
                activeUsers.map((u) => (
                  <div key={u.id} className="flex items-start justify-between gap-2 border-t border-emerald-50 px-6 py-3 first:border-t-0">
                    <div>
                      <p className="font-medium text-[var(--ink)]">{u.name}</p>
                      <p className="text-xs text-[var(--ink-muted)]">{u.email}</p>
                      <p className="text-[10px] text-emerald-700">{u.role}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      <p className="mt-1 text-[10px] text-[var(--ink-muted)]">{u.lastLoginAt ? formatDate(u.lastLoginAt) : "—"}</p>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-[var(--ink)]">Hızlı Erişim</h2>
            </CardHeader>
            <CardBody className="grid gap-2">
              <Link href="/admin/qr-codes"><Button type="button" variant="secondary" className="w-full justify-start text-xs"><QrCode className="h-4 w-4" /> QR Kodları</Button></Link>
              <Link href="/admin/users"><Button type="button" variant="secondary" className="w-full justify-start text-xs"><UserPlus className="h-4 w-4" /> Kullanıcılar</Button></Link>
              <Link href="/admin/sales"><Button type="button" variant="secondary" className="w-full justify-start text-xs"><ShoppingBag className="h-4 w-4" /> Satış & Bakiye</Button></Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
