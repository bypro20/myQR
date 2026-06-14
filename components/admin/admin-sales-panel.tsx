"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Bell,
  CheckCircle2,
  Coins,
  CreditCard,
  Download,
  Eraser,
  RefreshCw,
  Settings2,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { formatDate, formatCreditsDisplay } from "@/lib/utils";
import { useAdminNotifications } from "@/components/admin/admin-notification-provider";

type PaymentRow = {
  id: string;
  orderId: string;
  status: string;
  amountTry: number;
  credits: number;
  packageName: string;
  provider: string;
  createdAt: string;
  completedAt: string | null;
  customer: { id?: string; name: string; email: string } | null;
  organization: { name: string; credits: number; unlimitedCredits: boolean };
};

type BalanceRow = {
  id: string;
  name: string;
  slug: string;
  credits: number;
  unlimitedCredits: boolean;
  planTier: string;
  customer: { id: string; name: string; email: string } | null;
};

type Tx = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  organization: { name: string };
};

type RowAction = "approve" | "cancel" | "delete" | "refund" | "force_delete";

const statusLabel: Record<string, string> = {
  PENDING: "Bekliyor",
  AWAITING_CONFIRMATION: "Onay bekliyor",
  COMPLETED: "Tamamlandı",
  FAILED: "Başarısız",
  REFUNDED: "İade",
};

const statusVariant = (s: string) => {
  if (s === "COMPLETED") return "success" as const;
  if (s === "PENDING" || s === "AWAITING_CONFIRMATION") return "warning" as const;
  if (s === "FAILED") return "danger" as const;
  if (s === "REFUNDED") return "muted" as const;
  return "muted" as const;
};

const FILTER_OPTIONS = [
  { value: "ALL", label: "Tümü" },
  { value: "PENDING", label: "Bekleyen" },
  { value: "AWAITING_CONFIRMATION", label: "Onay bekleyen" },
  { value: "COMPLETED", label: "Tamamlanan" },
  { value: "FAILED", label: "Başarısız" },
  { value: "REFUNDED", label: "İade" },
] as const;

type DangerConfirm = {
  title: string;
  description: string;
  word: string;
  loadingKey: string;
  onRun: () => Promise<void>;
};

function DangerConfirmModal({
  config,
  input,
  onInput,
  onClose,
  busy,
}: {
  config: DangerConfirm;
  input: string;
  onInput: (v: string) => void;
  onClose: () => void;
  busy: boolean;
}) {
  const match = input.trim().toUpperCase() === config.word.toUpperCase();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-[var(--ink)]">{config.title}</h3>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">{config.description}</p>
        <p className="mt-4 text-sm font-semibold text-red-700">
          Onaylamak için <span className="font-mono">{config.word}</span> yazın:
        </p>
        <input
          autoFocus
          value={input}
          onChange={(e) => onInput(e.target.value)}
          className="input-focus mt-2 w-full rounded-lg border border-red-200 px-3 py-2.5 text-sm"
          placeholder={config.word}
          onKeyDown={(e) => {
            if (e.key === "Enter" && match && !busy) void config.onRun();
          }}
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" disabled={busy} onClick={onClose}>
            Vazgeç
          </Button>
          <Button type="button" variant="danger" disabled={!match || busy} onClick={() => void config.onRun()}>
            {busy ? "İşleniyor…" : "Onayla ve Sil"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminSalesPanel() {
  const { stats, pending, events, refresh } = useAdminNotifications();
  const [balances, setBalances] = useState<BalanceRow[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [allPayments, setAllPayments] = useState<PaymentRow[]>([]);
  const [paymentsLoaded, setPaymentsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState<{ id: string; action: RowAction } | null>(null);
  const [bulkLoading, setBulkLoading] = useState<string | null>(null);
  const [dangerConfirm, setDangerConfirm] = useState<DangerConfirm | null>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadExtras = useCallback(async () => {
    const [creditsRes, paymentsRes, meRes] = await Promise.all([
      fetch("/api/admin/credits"),
      fetch("/api/admin/payments?limit=200"),
      fetch("/api/admin/me"),
    ]);
    const data = await creditsRes.json();
    const paymentsData = await paymentsRes.json();
    const meData = await meRes.json();

    if (creditsRes.ok) {
      const rows: BalanceRow[] = (data.customers || []).map(
        (u: {
          id: string;
          name: string;
          email: string;
          memberships: Array<{
            organization: {
              id: string;
              name: string;
              slug: string;
              credits: number;
              unlimitedCredits: boolean;
              planTier: string;
            };
          }>;
        }) => ({
          id: u.memberships[0]?.organization.id,
          name: u.memberships[0]?.organization.name,
          slug: u.memberships[0]?.organization.slug,
          credits: u.memberships[0]?.organization.credits,
          unlimitedCredits: u.memberships[0]?.organization.unlimitedCredits,
          planTier: u.memberships[0]?.organization.planTier,
          customer: { id: u.id, name: u.name, email: u.email },
        }),
      );
      setBalances(rows.filter((r) => r.id));
      setTransactions(data.transactions || []);
    }
    if (paymentsRes.ok) {
      setAllPayments(paymentsData.payments || []);
      setPaymentsLoaded(true);
    }
    if (meRes.ok) {
      setIsSuperAdmin(meData.isSuperAdmin === true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    void loadExtras();
    const id = window.setInterval(() => {
      void refresh();
    }, 20_000);
    return () => window.clearInterval(id);
  }, [refresh, loadExtras]);

  async function reloadAll() {
    await refresh();
    await loadExtras();
  }

  function notifyOk(text: string) {
    setMessage(text);
    setError("");
  }

  function notifyErr(text: string) {
    setError(text);
    setMessage("");
  }

  async function approve(orderId: string) {
    setActionLoading({ id: orderId, action: "approve" });
    const res = await fetch(`/api/admin/payments/${orderId}/approve`, { method: "POST" });
    setActionLoading(null);
    if (res.ok) {
      notifyOk("Ödeme onaylandı, kredi yüklendi.");
      await reloadAll();
    } else {
      const data = await res.json();
      notifyErr(data.error || "Onay başarısız.");
    }
  }

  async function cancelOrder(orderId: string, customerName: string) {
    if (!confirm(`${customerName} — ödeme talebini iptal etmek istediğinize emin misiniz?`)) return;
    setActionLoading({ id: orderId, action: "cancel" });
    const res = await fetch(`/api/admin/payments/${orderId}/cancel`, { method: "POST" });
    setActionLoading(null);
    if (res.ok) {
      notifyOk("Ödeme talebi iptal edildi.");
      await reloadAll();
    } else {
      const data = await res.json();
      notifyErr(data.error || "İptal başarısız.");
    }
  }

  async function deleteOrder(orderId: string, customerName: string, force = false) {
    const msg = force
      ? `${customerName} — tamamlanan/iade kaydını kalıcı silmek istediğinize emin misiniz?`
      : `${customerName} — bu sipariş kaydını silmek istediğinize emin misiniz?`;
    if (!confirm(msg)) return;
    setActionLoading({ id: orderId, action: force ? "force_delete" : "delete" });
    const url = force ? `/api/admin/payments/${orderId}?force=true` : `/api/admin/payments/${orderId}`;
    const res = await fetch(url, { method: "DELETE" });
    setActionLoading(null);
    if (res.ok) {
      notifyOk("Sipariş kaydı silindi.");
      await reloadAll();
    } else {
      const data = await res.json();
      notifyErr(data.error || "Silme başarısız.");
    }
  }

  async function refundOrder(orderId: string, customerName: string) {
    if (!confirm(`${customerName} — ödemeyi iade edip krediyi geri almak istediğinize emin misiniz?`)) return;
    setActionLoading({ id: orderId, action: "refund" });
    const res = await fetch(`/api/admin/payments/${orderId}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deductCredits: true }),
    });
    setActionLoading(null);
    if (res.ok) {
      notifyOk("Ödeme iade edildi, kredi düşüldü.");
      await reloadAll();
    } else {
      const data = await res.json();
      notifyErr(data.error || "İade başarısız.");
    }
  }

  async function bulkAction(
    action: string,
    confirmText?: string,
    label?: string,
  ) {
    if (confirmText) {
      setConfirmInput("");
      setDangerConfirm({
        title: label || "Tehlikeli işlem",
        description: "Bu işlem geri alınamaz. Devam etmek istediğinize emin olun.",
        word: confirmText,
        loadingKey: action,
        onRun: async () => {
          await runBulkAction(action, confirmText);
          setDangerConfirm(null);
          setConfirmInput("");
        },
      });
      return;
    }

    if (!confirm(`${label || action} — devam edilsin mi?`)) return;
    await runBulkAction(action);
  }

  async function runBulkAction(action: string, confirmText?: string) {
    setBulkLoading(action);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...(confirmText ? { confirm: confirmText } : {}) }),
      });
      const data = await res.json();
      if (res.ok) {
        const count = data.count ?? 0;
        notifyOk(count > 0 ? `${count} kayıt silindi/işlendi.` : "Silinecek kayıt bulunamadı.");
        setAllPayments([]);
        await reloadAll();
      } else {
        notifyErr(data.error || "Toplu işlem başarısız.");
      }
    } catch {
      notifyErr("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setBulkLoading(null);
    }
  }

  function openDangerConfirm(opts: Omit<DangerConfirm, "onRun"> & { onRun: () => Promise<void> }) {
    setConfirmInput("");
    setDangerConfirm({
      ...opts,
      onRun: async () => {
        await opts.onRun();
        setDangerConfirm(null);
        setConfirmInput("");
      },
    });
  }

  async function resetCreditHistory(scope: "all" | "org", orgId?: string) {
    if (scope === "all") {
      openDangerConfirm({
        title: "Kredi hareket geçmişini sıfırla",
        description: "Tüm kullanıcıların kredi hareket kayıtları kalıcı olarak silinecek. Bakiyeler değişmez.",
        word: "SIFIRLA",
        loadingKey: "reset_transactions",
        onRun: async () => {
          setBulkLoading("reset_transactions");
          try {
            const res = await fetch("/api/admin/credits", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "reset_transactions", scope: "all", confirm: "SIFIRLA" }),
            });
            const data = await res.json();
            if (res.ok) {
              notifyOk(`${data.count ?? 0} kredi hareketi silindi.`);
              await reloadAll();
            } else {
              notifyErr(data.error || "Sıfırlama başarısız.");
            }
          } catch {
            notifyErr("Bağlantı hatası.");
          } finally {
            setBulkLoading(null);
          }
        },
      });
      return;
    }

    if (!confirm("Seçili kullanıcının kredi hareket geçmişi silinecek. Devam?")) return;
    setBulkLoading("reset_transactions");
    const res = await fetch("/api/admin/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_transactions", organizationId: orgId }),
    });
    const data = await res.json();
    setBulkLoading(null);
    if (res.ok) {
      notifyOk(`${data.count ?? 0} kredi hareketi silindi.`);
      await reloadAll();
    } else {
      notifyErr(data.error || "Sıfırlama başarısız.");
    }
  }

  async function resetAllBalances() {
    openDangerConfirm({
      title: "Tüm bakiyeleri sıfırla",
      description: "Tüm organizasyonların kredi bakiyesi 0 yapılacak. Bu işlem geri alınamaz.",
      word: "SIFIRLA",
      loadingKey: "reset_balances",
      onRun: async () => {
        setBulkLoading("reset_balances");
        try {
          const res = await fetch("/api/admin/credits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reset_balances", confirm: "SIFIRLA" }),
          });
          const data = await res.json();
          if (res.ok) {
            notifyOk(`${data.count ?? 0} organizasyon bakiyesi sıfırlandı.`);
            await reloadAll();
          } else {
            notifyErr(data.error || "Bakiye sıfırlama başarısız.");
          }
        } catch {
          notifyErr("Bağlantı hatası.");
        } finally {
          setBulkLoading(null);
        }
      },
    });
  }

  function isBusy(orderId: string, action?: RowAction) {
    if (!actionLoading || actionLoading.id !== orderId) return false;
    return action ? actionLoading.action === action : true;
  }

  const filteredHistory = useMemo(() => {
    const source = paymentsLoaded ? allPayments : events;
    if (historyFilter === "ALL") return source;
    return source.filter((e) => e.status === historyFilter);
  }, [paymentsLoaded, allPayments, events, historyFilter]);

  const completedEvents = events.filter((e) => e.status === "COMPLETED");

  function renderRowActions(p: PaymentRow) {
    const name = p.customer?.name || p.organization.name;
    const pendingStatus = p.status === "PENDING" || p.status === "AWAITING_CONFIRMATION";

    return (
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
        {pendingStatus ? (
          <>
            <Button variant="accent" className="whitespace-nowrap px-2.5 py-1.5 text-[11px]" disabled={isBusy(p.orderId)} onClick={() => approve(p.orderId)}>
              {isBusy(p.orderId, "approve") ? "…" : "Onayla"}
            </Button>
            <Button variant="secondary" className="whitespace-nowrap px-2.5 py-1.5 text-[11px]" disabled={isBusy(p.orderId)} onClick={() => cancelOrder(p.orderId, name)}>
              {isBusy(p.orderId, "cancel") ? "…" : "İptal"}
            </Button>
            <Button variant="danger" className="whitespace-nowrap px-2.5 py-1.5 text-[11px]" disabled={isBusy(p.orderId)} onClick={() => deleteOrder(p.orderId, name)}>
              {isBusy(p.orderId, "delete") ? "…" : "Sil"}
            </Button>
          </>
        ) : null}
        {p.status === "COMPLETED" ? (
          <>
            <Button variant="secondary" className="whitespace-nowrap px-2.5 py-1.5 text-[11px]" disabled={isBusy(p.orderId)} onClick={() => refundOrder(p.orderId, name)}>
              {isBusy(p.orderId, "refund") ? "…" : "İade Et"}
            </Button>
            {isSuperAdmin ? (
              <Button variant="danger" className="whitespace-nowrap px-2.5 py-1.5 text-[11px]" disabled={isBusy(p.orderId)} onClick={() => deleteOrder(p.orderId, name, true)}>
                {isBusy(p.orderId, "force_delete") ? "…" : "Zorla Sil"}
              </Button>
            ) : null}
          </>
        ) : null}
        {(p.status === "FAILED" || p.status === "REFUNDED") ? (
          <Button variant="danger" className="whitespace-nowrap px-2.5 py-1.5 text-[11px]" disabled={isBusy(p.orderId)} onClick={() => deleteOrder(p.orderId, name, p.status === "REFUNDED" && isSuperAdmin)}>
            {isBusy(p.orderId, "delete") || isBusy(p.orderId, "force_delete") ? "…" : "Sil"}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Satış & Bakiye"
        description="Satın alma bildirimleri, ödeme geçmişi, bakiye yönetimi ve platform araçları"
        action={
          <div className="flex flex-wrap gap-2">
            <a href="/api/admin/payments/export" download>
              <Button variant="secondary">
                <Download className="h-4 w-4" />
                CSV İndir
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
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Bugünkü Gelir" value={`₺${stats.todayRevenueTry.toLocaleString("tr-TR")}`} icon={TrendingUp} tone="emerald" />
          <StatCard label="Bekleyen Ödeme" value={stats.pendingCount} icon={Bell} tone="orange" />
          <StatCard label="Toplam Gelir" value={`₺${stats.totalRevenueTry.toLocaleString("tr-TR")}`} icon={CreditCard} tone="violet" />
          <StatCard label="Platform Bakiyesi" value={stats.totalPlatformCredits.toLocaleString("tr-TR")} icon={Wallet} tone="sky" />
        </div>
      ) : null}

      {/* Yönetim araçları */}
      <Card className="border-violet-200/60">
        <CardHeader className="bg-violet-50/40">
          <h2 className="flex items-center gap-2 font-semibold text-[var(--ink)]">
            <Settings2 className="h-5 w-5 text-violet-600" />
            Yönetim Araçları
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Ödeme İşlemleri</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" className="text-xs" disabled={!!bulkLoading} onClick={() => bulkAction("cancel_all_pending", undefined, "Tüm bekleyen ödemeleri iptal et")}>
                <XCircle className="h-3.5 w-3.5" />
                {bulkLoading === "cancel_all_pending" ? "…" : "Bekleyenleri İptal Et"}
              </Button>
              <Button type="button" variant="secondary" className="text-xs" disabled={!!bulkLoading} onClick={() => bulkAction("delete_failed", undefined, "Başarısız kayıtları sil")}>
                <Trash2 className="h-3.5 w-3.5" />
                {bulkLoading === "delete_failed" ? "…" : "Başarısızları Sil"}
              </Button>
              <Button type="button" variant="secondary" className="text-xs" disabled={!!bulkLoading} onClick={() => bulkAction("delete_non_completed", undefined, "Tamamlanmamış tüm kayıtları sil")}>
                <Eraser className="h-3.5 w-3.5" />
                {bulkLoading === "delete_non_completed" ? "…" : "Tamamlanmayanları Sil"}
              </Button>
              <Button type="button" variant="danger" className="text-xs" disabled={!!bulkLoading} onClick={() => bulkAction("reset_payment_history", "SIFIRLA", "Tüm ödeme geçmişini sil")}>
                <RefreshCw className="h-3.5 w-3.5" />
                {bulkLoading === "reset_payment_history" ? "…" : "Geçmişi Sıfırla"}
              </Button>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">Bakiye & Kredi</p>
            <div className="flex flex-wrap gap-2">
              <>
                <Button type="button" variant="danger" className="text-xs" disabled={!!bulkLoading} onClick={() => resetCreditHistory("all")}>
                  <Eraser className="h-3.5 w-3.5" />
                  {bulkLoading === "reset_transactions" ? "…" : "Kredi Hareketlerini Sıfırla"}
                </Button>
                <Button type="button" variant="danger" className="text-xs" disabled={!!bulkLoading} onClick={resetAllBalances}>
                  <Wallet className="h-3.5 w-3.5" />
                  {bulkLoading === "reset_balances" ? "…" : "Tüm Bakiyeleri Sıfırla"}
                </Button>
              </>
              <Link href="/admin/credits">
                <Button variant="accent" className="text-xs">
                  <Coins className="h-3.5 w-3.5" />
                  Kredi Yükle / Ayarla
                </Button>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Onay bekleyen */}
      <Card className="border-orange-200/60">
        <CardHeader className="flex flex-wrap items-center justify-between gap-2 bg-orange-50/40">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-orange-600" />
            <h2 className="font-semibold text-[var(--ink)]">Onay Bekleyen Satın Almalar</h2>
          </div>
          <Badge variant="accent">{pending.length} bekliyor</Badge>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          {pending.length === 0 ? (
            <p className="px-6 py-10 text-center text-[var(--ink-muted)]">Onay bekleyen ödeme yok.</p>
          ) : (
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-orange-50/30 text-left text-[var(--ink-muted)]">
                <tr>
                  <th className="px-4 py-3">Kullanıcı</th>
                  <th className="px-4 py-3">Paket</th>
                  <th className="px-4 py-3">Tutar</th>
                  <th className="px-4 py-3">Kredi</th>
                  <th className="px-4 py-3">Mevcut Bakiye</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="sticky right-0 min-w-[240px] bg-orange-50/95 px-4 py-3 text-right shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)]">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.orderId} className="border-t border-orange-50 align-middle">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[var(--ink)]">{p.customer?.name || p.organization.name}</p>
                      <p className="text-xs text-[var(--ink-muted)]">{p.customer?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">{p.packageName}</td>
                    <td className="px-4 py-3 font-bold text-violet-700">₺{p.amountTry.toLocaleString("tr-TR")}</td>
                    <td className="px-4 py-3">+{p.credits}</td>
                    <td className="px-4 py-3">
                      {formatCreditsDisplay(p.organization.credits, p.organization.unlimitedCredits)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="warning">{statusLabel[p.status] || p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--ink-muted)]">{formatDate(p.createdAt)}</td>
                    <td className="sticky right-0 bg-white px-4 py-3 text-right shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.06)]">
                      {renderRowActions(p)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Tam ödeme geçmişi */}
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-semibold text-[var(--ink)]">
            <CreditCard className="h-5 w-5 text-violet-600" />
            Ödeme Geçmişi
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setHistoryFilter(f.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  historyFilter === f.value
                    ? "bg-violet-600 text-white"
                    : "bg-violet-50 text-violet-700 hover:bg-violet-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          {filteredHistory.length === 0 ? (
            <p className="px-6 py-10 text-center text-[var(--ink-muted)]">Kayıt bulunamadı.</p>
          ) : (
            <table className="min-w-[1000px] w-full text-sm">
              <thead className="bg-violet-50/50 text-left text-[var(--ink-muted)]">
                <tr>
                  <th className="px-4 py-3">Kullanıcı</th>
                  <th className="px-4 py-3">Paket</th>
                  <th className="px-4 py-3">Tutar</th>
                  <th className="px-4 py-3">Kredi</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3">Sağlayıcı</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="sticky right-0 min-w-[200px] bg-violet-50/95 px-4 py-3 text-right shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)]">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((p) => (
                  <tr key={p.id} className="border-t border-violet-50 align-middle">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--ink)]">{p.customer?.name || p.organization.name}</p>
                      <p className="text-xs text-[var(--ink-muted)]">{p.customer?.email}</p>
                    </td>
                    <td className="px-4 py-3">{p.packageName}</td>
                    <td className="px-4 py-3 font-bold text-violet-700">₺{p.amountTry.toLocaleString("tr-TR")}</td>
                    <td className="px-4 py-3">{p.credits}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(p.status)}>{statusLabel[p.status] || p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--ink-muted)]">{p.provider}</td>
                    <td className="px-4 py-3 text-[var(--ink-muted)]">{formatDate(p.completedAt || p.createdAt)}</td>
                    <td className="sticky right-0 bg-white px-4 py-3 text-right shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.06)]">
                      {renderRowActions(p)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-semibold text-[var(--ink)]">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Son Tamamlanan Satın Almalar
            </h2>
          </CardHeader>
          <CardBody className="space-y-0 p-0">
            {completedEvents.slice(0, 10).map((ev) => (
              <div key={ev.id} className="flex items-start justify-between gap-3 border-t border-violet-50 px-6 py-4 first:border-t-0">
                <div>
                  <p className="font-medium text-[var(--ink)]">{ev.customer?.name || ev.organization.name}</p>
                  <p className="text-xs text-[var(--ink-muted)]">
                    {ev.packageName} · {ev.credits} kredi · {ev.provider}
                  </p>
                  <p className="text-[11px] text-[var(--ink-muted)]">{formatDate(ev.completedAt || ev.createdAt)}</p>
                </div>
                <p className="shrink-0 font-bold text-emerald-700">₺{ev.amountTry.toLocaleString("tr-TR")}</p>
              </div>
            ))}
            {completedEvents.length === 0 ? (
              <p className="px-6 py-10 text-center text-[var(--ink-muted)]">Henüz tamamlanan satış yok.</p>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-semibold text-[var(--ink)]">
              <Bell className="h-5 w-5 text-violet-600" />
              Canlı Bildirim Akışı
            </h2>
          </CardHeader>
          <CardBody className="max-h-[420px] space-y-0 overflow-y-auto p-0">
            {events.slice(0, 15).map((ev) => (
              <div key={ev.id} className="border-t border-violet-50 px-6 py-3 first:border-t-0">
                <p className="text-sm text-[var(--ink)]">{ev.message}</p>
                <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">{formatDate(ev.createdAt)}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold text-[var(--ink)]">
            <Wallet className="h-5 w-5 text-sky-600" />
            Kullanıcı Bakiyeleri
          </h2>
          <Link href="/admin/credits" className="text-xs font-semibold text-violet-600 hover:underline">
            Bakiye düzenle →
          </Link>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          {loading ? (
            <p className="px-6 py-10 text-center text-[var(--ink-muted)]">Yükleniyor…</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-violet-50/50 text-left text-[var(--ink-muted)]">
                <tr>
                  <th className="px-6 py-3">Kullanıcı</th>
                  <th className="px-6 py-3">Organizasyon</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Bakiye</th>
                  <th className="px-6 py-3">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((b) => (
                  <tr key={b.id} className="border-t border-violet-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--ink)]">{b.customer?.name}</p>
                      <p className="text-xs text-[var(--ink-muted)]">{b.customer?.email}</p>
                    </td>
                    <td className="px-6 py-4">{b.name}</td>
                    <td className="px-6 py-4">{b.planTier}</td>
                    <td className="px-6 py-4 font-bold text-amber-700">
                      {formatCreditsDisplay(b.credits, b.unlimitedCredits)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <Link href={`/admin/credits?user=${b.customer?.id}`}>
                          <Button variant="secondary" className="px-3 py-1.5 text-xs">
                            Bakiye Yönet
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="px-2 py-1.5 text-xs text-red-600"
                          onClick={async () => {
                            if (!confirm(`${b.customer?.name} bakiyesini sıfırlamak istiyor musunuz?`)) return;
                            const res = await fetch("/api/admin/credits", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                action: "reset_balance",
                                userId: b.customer?.id,
                                organizationId: b.id,
                              }),
                            });
                            if (res.ok) {
                              notifyOk("Bakiye sıfırlandı.");
                              await reloadAll();
                            } else {
                              const data = await res.json();
                              notifyErr(data.error || "Sıfırlama başarısız.");
                            }
                          }}
                        >
                          Sıfırla
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-[var(--ink)]">Son Bakiye Hareketleri</h2>
          <Button type="button" variant="ghost" className="text-xs text-red-600" disabled={!!bulkLoading} onClick={() => resetCreditHistory("all")}>
            Geçmişi Temizle
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-violet-50/50 text-left text-[var(--ink-muted)]">
              <tr>
                <th className="px-6 py-3">Organizasyon</th>
                <th className="px-6 py-3">Açıklama</th>
                <th className="px-6 py-3">Miktar</th>
                <th className="px-6 py-3">Bakiye Sonrası</th>
                <th className="px-6 py-3">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 20).map((tx) => (
                <tr key={tx.id} className="border-t border-violet-50">
                  <td className="px-6 py-4">{tx.organization.name}</td>
                  <td className="px-6 py-4">{tx.description}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 font-semibold ${tx.amount >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                      {tx.amount >= 0 ? <ArrowUpCircle className="h-3.5 w-3.5" /> : <ArrowDownCircle className="h-3.5 w-3.5" />}
                      {tx.amount >= 0 ? "+" : ""}
                      {tx.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{tx.balanceAfter}</td>
                  <td className="px-6 py-4 text-[var(--ink-muted)]">{formatDate(tx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {dangerConfirm ? (
        <DangerConfirmModal
          config={dangerConfirm}
          input={confirmInput}
          onInput={setConfirmInput}
          onClose={() => {
            setDangerConfirm(null);
            setConfirmInput("");
          }}
          busy={bulkLoading === dangerConfirm.loadingKey}
        />
      ) : null}
    </div>
  );
}
