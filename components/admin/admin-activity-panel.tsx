"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Building2,
  Coins,
  CreditCard,
  Eraser,
  LogIn,
  QrCode,
  Radio,
  RefreshCw,
  ShoppingBag,
  Trash2,
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
  { value: "PAYMENT_CLAIMED", label: "FAST Bildirimi" },
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
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetWord, setResetWord] = useState("");

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
    const poll = () => {
      if (document.hidden) return;
      void load();
    };
    poll();
    const id = window.setInterval(poll, 30_000);
    const onVisible = () => {
      if (!document.hidden) void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [live, load]);

  const filtered = useMemo(() => {
    if (filter === "ALL") return activities;
    return activities.filter((a) => a.kind === filter);
  }, [activities, filter]);

  async function cleanup(
    action: string,
    extra?: { kind?: string; confirm?: string },
    confirmMsg?: string,
  ) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setBusy(action);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Temizleme başarısız.");
        return;
      }
      setMessage(`${data.count ?? 0} kayıt silindi.`);
      await load();
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setBusy(null);
    }
  }

  const currentFilterLabel = FILTER_OPTIONS.find((f) => f.value === filter)?.label ?? "Tümü";

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

      {message ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <Card className="border-violet-100">
        <CardBody className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">Aktivite temizleme</p>
            <p className="text-xs text-[var(--ink-muted)]">İşlem geçmişini kategoriye göre veya tamamen sıfırlayın</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filter !== "ALL" ? (
              <Button
                className="px-3 py-1.5 text-xs"
                variant="secondary"
                disabled={!!busy}
                onClick={() =>
                  cleanup(
                    "clear_kind",
                    { kind: filter },
                    `«${currentFilterLabel}» kayıtları silinsin mi?`,
                  )
                }
              >
                <Eraser className="h-3.5 w-3.5" />
                {busy === "clear_kind" ? "…" : `«${currentFilterLabel}» temizle`}
              </Button>
            ) : null}
            <Button
              className="px-3 py-1.5 text-xs"
              variant="secondary"
              disabled={!!busy}
              onClick={() => cleanup("clear_credit", undefined, "Kredi işlem kayıtları silinsin mi?")}
            >
              <Coins className="h-3.5 w-3.5" />
              {busy === "clear_credit" ? "…" : "Kredi kayıtları"}
            </Button>
            <Button
              className="px-3 py-1.5 text-xs"
              variant="secondary"
              disabled={!!busy}
              onClick={() => cleanup("clear_payment", undefined, "Ödeme kayıtları silinsin mi?")}
            >
              <CreditCard className="h-3.5 w-3.5" />
              {busy === "clear_payment" ? "…" : "Ödeme kayıtları"}
            </Button>
            <Button
              className="px-3 py-1.5 text-xs"
              variant="secondary"
              disabled={!!busy}
              onClick={() => cleanup("clear_auth", undefined, "Giriş ve kayıt kayıtları silinsin mi?")}
            >
              <LogIn className="h-3.5 w-3.5" />
              {busy === "clear_auth" ? "…" : "Giriş kayıtları"}
            </Button>
            <Button
              className="px-3 py-1.5 text-xs"
              variant="danger"
              disabled={!!busy}
              onClick={() => setShowResetModal(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Tümünü sıfırla
            </Button>
          </div>
        </CardBody>
      </Card>

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
              <Link href="/admin/sales"><Button type="button" variant="secondary" className="w-full justify-start text-xs"><ShoppingBag className="h-4 w-4" /> Ödeme Yönetimi</Button></Link>
            </CardBody>
          </Card>
        </div>
      </div>

      {showResetModal ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--ink)]">Tüm aktivite geçmişini sil</h3>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Tüm işlem akışı kayıtları kalıcı olarak silinir. Kullanıcılar ve ödemeler etkilenmez.
            </p>
            <p className="mt-4 text-sm font-semibold text-red-700">
              Onay için <span className="font-mono">SIFIRLA</span> yazın:
            </p>
            <input
              autoFocus
              value={resetWord}
              onChange={(e) => setResetWord(e.target.value)}
              className="input-focus mt-2 w-full rounded-lg border border-red-200 px-3 py-2.5 text-sm"
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setShowResetModal(false); setResetWord(""); }}>
                Vazgeç
              </Button>
              <Button
                variant="danger"
                disabled={resetWord.trim().toUpperCase() !== "SIFIRLA" || !!busy}
                onClick={() => {
                  void cleanup("clear_all", { confirm: "SIFIRLA" }).then(() => {
                    setShowResetModal(false);
                    setResetWord("");
                  });
                }}
              >
                {busy === "clear_all" ? "…" : "Sıfırla"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
