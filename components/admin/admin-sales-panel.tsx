"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Coins,
  Download,
  Eraser,
  Landmark,
  Layers,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { cn, formatDate, formatCreditsDisplay } from "@/lib/utils";

type PaymentRow = {
  id: string;
  orderId: string;
  status: string;
  amountTry: number;
  credits: number;
  packageName: string;
  orderType?: "credits" | "subscription";
  provider: string;
  createdAt: string;
  claimedAt?: string | null;
  completedAt: string | null;
  customer: { name: string; email: string } | null;
  organization: { name: string; credits: number; unlimitedCredits: boolean };
};

type SalesStats = {
  fastClaimedCount: number;
  pendingCount: number;
  todayRevenueTry: number;
  totalRevenueTry: number;
};

type ViewTab = "action" | "ALL" | "AWAITING_CONFIRMATION" | "PENDING" | "COMPLETED" | "FAILED";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  AWAITING_CONFIRMATION: "FAST onay",
  COMPLETED: "Tamamlandı",
  FAILED: "Başarısız",
  REFUNDED: "İade",
};

const VIEW_TABS: { id: ViewTab; label: string }[] = [
  { id: "action", label: "İşlem gereken" },
  { id: "AWAITING_CONFIRMATION", label: "FAST onay" },
  { id: "PENDING", label: "Bekleyen" },
  { id: "ALL", label: "Tümü" },
  { id: "COMPLETED", label: "Tamamlanan" },
  { id: "FAILED", label: "Başarısız" },
];

function statusVariant(status: string) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "PENDING" || status === "AWAITING_CONFIRMATION") return "warning" as const;
  if (status === "FAILED") return "danger" as const;
  return "muted" as const;
}

function rowKey(p: PaymentRow) {
  return p.orderId || p.id;
}

export function AdminSalesPanel() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [tab, setTab] = useState<ViewTab>("action");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetWord, setResetWord] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

  const load = useCallback(async () => {
    try {
      const [paymentsRes, notifRes, meRes] = await Promise.all([
        fetch("/api/admin/payments?limit=300", { cache: "no-store" }),
        fetch("/api/admin/notifications", { cache: "no-store" }),
        fetch("/api/admin/me", { cache: "no-store" }),
      ]);

      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        const rows: PaymentRow[] = (data.payments || []).map((p: PaymentRow) => ({
          ...p,
          id: p.id || p.orderId,
          orderId: p.orderId || p.id,
          customer: p.customer ?? null,
          organization: p.organization ?? { name: "—", credits: 0, unlimitedCredits: false },
        }));
        setPayments(rows);
      }

      if (notifRes.ok) {
        const data = await notifRes.json();
        if (data.stats) {
          setStats({
            fastClaimedCount: data.stats.fastClaimedCount ?? 0,
            pendingCount: data.stats.pendingCount ?? 0,
            todayRevenueTry: data.stats.todayRevenueTry ?? 0,
            totalRevenueTry: data.stats.totalRevenueTry ?? 0,
          });
        }
      }

      if (meRes.ok) {
        const me = await meRes.json();
        setIsSuperAdmin(me.isSuperAdmin === true);
      }
    } catch {
      setError("Veriler yüklenemedi. Sayfayı yenileyin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 12_000);
    return () => window.clearInterval(id);
  }, [load]);

  const filtered = useMemo(() => {
    if (tab === "action") {
      return payments.filter(
        (p) => p.status === "AWAITING_CONFIRMATION" || p.status === "PENDING",
      );
    }
    if (tab === "ALL") return payments;
    return payments.filter((p) => p.status === tab);
  }, [payments, tab]);

  function notifyOk(text: string) {
    setMessage(text);
    setError("");
  }

  function notifyErr(text: string) {
    setError(text);
    setMessage("");
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (filtered.every((p) => selectedIds.has(rowKey(p)))) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const p of filtered) next.delete(rowKey(p));
        return next;
      });
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const p of filtered) next.add(rowKey(p));
      return next;
    });
  }

  async function bulkAction(
    action: string,
    extra?: { orderIds?: string[]; force?: boolean; confirm?: string },
  ) {
    setBusy(action);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) {
        notifyErr(data.error || "İşlem başarısız.");
        return;
      }
      if (action === "delete_selected") {
        notifyOk(`${data.deleted ?? 0} kayıt silindi.`);
      } else if (action === "approve_selected") {
        notifyOk(`${data.approved ?? 0} ödeme onaylandı.`);
      } else if (action === "cancel_selected") {
        notifyOk(`${data.cancelled ?? 0} ödeme iptal edildi.`);
      } else {
        notifyOk(`${data.count ?? 0} kayıt işlendi.`);
      }
      setSelectedIds(new Set());
      await load();
    } catch {
      notifyErr("Bağlantı hatası.");
    } finally {
      setBusy(null);
    }
  }

  async function rowAction(orderId: string, action: "approve" | "cancel" | "delete", force = false) {
    setRowBusy(orderId);
    try {
      if (action === "approve") {
        const res = await fetch(`/api/admin/payments/${orderId}/approve`, { method: "POST" });
        if (!res.ok) {
          const data = await res.json();
          notifyErr(data.error || "Onay başarısız.");
          return;
        }
        notifyOk("Ödeme onaylandı.");
      } else if (action === "cancel") {
        const res = await fetch(`/api/admin/payments/${orderId}/cancel`, { method: "POST" });
        if (!res.ok) {
          const data = await res.json();
          notifyErr(data.error || "İptal başarısız.");
          return;
        }
        notifyOk("Ödeme iptal edildi.");
      } else {
        const url = force ? `/api/admin/payments/${orderId}?force=true` : `/api/admin/payments/${orderId}`;
        const res = await fetch(url, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json();
          notifyErr(data.error || "Silme başarısız.");
          return;
        }
        notifyOk("Kayıt silindi.");
      }
      await load();
    } finally {
      setRowBusy(null);
    }
  }

  const selectedList = Array.from(selectedIds);
  const allSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(rowKey(p)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ödeme Yönetimi"
        description="FAST onayları, abonelik ve kredi ödemeleri — tek panelden yönetin"
        action={
          <div className="flex flex-wrap gap-2">
            <a href="/api/admin/payments/export" download>
              <Button variant="secondary">
                <Download className="h-4 w-4" />
                CSV
              </Button>
            </a>
            <Link href="/admin/credits">
              <Button variant="secondary">
                <Coins className="h-4 w-4" />
                Kredi Yönetimi
              </Button>
            </Link>
          </div>
        }
      />

      {message ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="FAST Onay" value={stats.fastClaimedCount} icon={Landmark} tone="orange" />
          <StatCard label="Bekleyen" value={stats.pendingCount} icon={Bell} tone="violet" />
          <StatCard label="Bugün Gelir" value={`₺${stats.todayRevenueTry.toLocaleString("tr-TR")}`} icon={TrendingUp} tone="emerald" />
          <StatCard label="Toplam Gelir" value={`₺${stats.totalRevenueTry.toLocaleString("tr-TR")}`} icon={CheckCircle2} tone="sky" />
        </div>
      ) : null}

      <Card className="overflow-hidden border-violet-100 shadow-sm">
        <div className="border-b border-violet-100 bg-violet-50/40 px-4 py-4">
          <p className="text-sm font-semibold text-[var(--ink)]">Ödeme listesi</p>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">
            Müşteri FAST bildirimi gönderince «FAST onay» sekmesine düşer. Onay → plan veya kredi otomatik yüklenir.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {VIEW_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  tab === t.id ? "bg-violet-600 text-white" : "bg-white text-violet-700 hover:bg-violet-100",
                )}
              >
                {t.label}
                {t.id === "AWAITING_CONFIRMATION" && stats && stats.fastClaimedCount > 0 ? (
                  <span className="ml-1.5 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] text-white">
                    {stats.fastClaimedCount}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-50 bg-white px-4 py-3">
          <p className="text-sm text-[var(--ink-muted)]">
            {filtered.length} kayıt
            {selectedList.length > 0 ? ` · ${selectedList.length} seçili` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedList.length > 0 ? (
              <>
                <Button className="px-3 py-1.5 text-xs" variant="accent" disabled={!!busy} onClick={() => bulkAction("approve_selected", { orderIds: selectedList })}>
                  {busy === "approve_selected" ? "…" : "Onayla"}
                </Button>
                <Button className="px-3 py-1.5 text-xs" variant="secondary" disabled={!!busy} onClick={() => bulkAction("cancel_selected", { orderIds: selectedList })}>
                  {busy === "cancel_selected" ? "…" : "İptal"}
                </Button>
                <Button
                  className="px-3 py-1.5 text-xs"
                  variant="danger"
                  disabled={!!busy}
                  onClick={() => {
                    if (!confirm(`${selectedList.length} kayıt silinsin mi?`)) return;
                    void bulkAction("delete_selected", { orderIds: selectedList, force: isSuperAdmin });
                  }}
                >
                  {busy === "delete_selected" ? "…" : "Sil"}
                </Button>
              </>
            ) : null}
            <Button
              className="px-3 py-1.5 text-xs"
              variant="secondary"
              disabled={!!busy}
              onClick={() => {
                if (!confirm("Bekleyen ve tamamlanmamış tüm kayıtlar silinsin mi?")) return;
                void bulkAction("delete_non_completed");
              }}
            >
              <Eraser className="h-3.5 w-3.5" />
              {busy === "delete_non_completed" ? "…" : "Bekleyenleri temizle"}
            </Button>
            <Button className="px-3 py-1.5 text-xs" variant="danger" disabled={!!busy} onClick={() => setShowResetModal(true)}>
              <Trash2 className="h-3.5 w-3.5" />
              Geçmişi sıfırla
            </Button>
          </div>
        </div>

        <CardBody className="overflow-x-auto p-0">
          {loading ? (
            <p className="px-6 py-12 text-center text-[var(--ink-muted)]">Yükleniyor…</p>
          ) : filtered.length === 0 ? (
            <p className="px-6 py-12 text-center text-[var(--ink-muted)]">Bu filtrede kayıt yok.</p>
          ) : (
            <table className="min-w-[960px] w-full text-sm">
              <thead className="bg-violet-50/50 text-left text-[var(--ink-muted)]">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 cursor-pointer rounded"
                      aria-label="Tümünü seç"
                    />
                  </th>
                  <th className="px-4 py-3">Kullanıcı</th>
                  <th className="px-4 py-3">Tür</th>
                  <th className="px-4 py-3">Paket</th>
                  <th className="px-4 py-3">Tutar</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const key = rowKey(p);
                  const pending = p.status === "PENDING" || p.status === "AWAITING_CONFIRMATION";
                  const name = p.customer?.name || p.organization.name;
                  return (
                    <tr key={key} className={cn("border-t border-violet-50", selectedIds.has(key) && "bg-violet-50/50")}>
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(key)}
                          onChange={() => toggleSelect(key)}
                          className="h-4 w-4 cursor-pointer rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--ink)]">{name}</p>
                        <p className="text-xs text-[var(--ink-muted)]">{p.customer?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {p.orderType === "subscription" ? (
                          <Badge variant="accent" className="gap-1">
                            <Layers className="h-3 w-3" />
                            Abonelik
                          </Badge>
                        ) : (
                          <Badge variant="muted" className="gap-1">
                            <Coins className="h-3 w-3" />
                            Kredi
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{p.packageName}</p>
                        <p className="text-xs text-[var(--ink-muted)]">
                          +{p.credits} kr · {formatCreditsDisplay(p.organization.credits, p.organization.unlimitedCredits)}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-bold text-violet-700">₺{p.amountTry.toLocaleString("tr-TR")}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant(p.status)}>{STATUS_LABEL[p.status] || p.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-[var(--ink-muted)]">{formatDate(p.claimedAt || p.completedAt || p.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {pending ? (
                            <>
                              <Button className="px-2.5 py-1.5 text-xs" variant="accent" disabled={rowBusy === key} onClick={() => void rowAction(key, "approve")}>
                                Onayla
                              </Button>
                              <Button className="px-2.5 py-1.5 text-xs" variant="secondary" disabled={rowBusy === key} onClick={() => void rowAction(key, "cancel")}>
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : null}
                          <Button
                            className="px-2.5 py-1.5 text-xs"
                            variant="danger"
                            disabled={rowBusy === key}
                            onClick={() => void rowAction(key, "delete", isSuperAdmin && p.status === "COMPLETED")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {showResetModal ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--ink)]">Tüm ödeme geçmişini sil</h3>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Tamamlanan dahil tüm ödeme kayıtları kalıcı silinir. Bakiyeler değişmez.
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
                  void bulkAction("reset_payment_history", { confirm: "SIFIRLA" }).then(() => {
                    setShowResetModal(false);
                    setResetWord("");
                  });
                }}
              >
                {busy === "reset_payment_history" ? "…" : "Sıfırla"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
