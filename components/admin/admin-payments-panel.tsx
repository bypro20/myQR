"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

type Payment = {
  id: string;
  amountTry: number;
  credits: number;
  status: string;
  packageId: string;
  provider: string;
  createdAt: string;
  completedAt: string | null;
  organization: { name: string; slug: string };
};

const statusLabel: Record<string, string> = {
  PENDING: "Bekliyor",
  AWAITING_CONFIRMATION: "Onay bekliyor",
  COMPLETED: "Tamamlandı",
  FAILED: "Başarısız",
  REFUNDED: "İade",
};

const statusVariant = (s: string) => {
  if (s === "COMPLETED") return "success" as const;
  if (s === "AWAITING_CONFIRMATION") return "warning" as const;
  if (s === "PENDING") return "warning" as const;
  if (s === "FAILED") return "danger" as const;
  return "muted" as const;
};

function canApprove(p: Payment) {
  return p.status === "AWAITING_CONFIRMATION" || p.status === "PENDING";
}

export function AdminPaymentsPanel() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [approving, setApproving] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((data) => {
        setPayments(data.payments || []);
        setTotalRevenue(data.stats?.revenueTry || 0);
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    setApproving(id);
    const res = await fetch(`/api/admin/payments/${id}/approve`, { method: "POST" });
    setApproving(null);
    if (res.ok) load();
  }

  if (loading) return <p className="text-[var(--ink-muted)]">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ödeme Geçmişi"
        description={`Toplam tamamlanan gelir: ₺${totalRevenue.toLocaleString("tr-TR")}. FAST ödemeleri banka hesabında gördükten sonra onaylayın.`}
      />

      <Card>
        <CardBody className="overflow-x-auto p-0">
          {payments.length === 0 ? (
            <p className="px-6 py-12 text-center text-[var(--ink-muted)]">Henüz ödeme kaydı bulunmuyor.</p>
          ) : (
            <table className="min-w-[960px] w-full text-sm">
              <thead className="bg-violet-50/50 text-left text-[var(--ink-muted)]">
                <tr>
                  <th className="px-4 py-3 sm:px-6">Organizasyon</th>
                  <th className="px-4 py-3 sm:px-6">Paket</th>
                  <th className="px-4 py-3 sm:px-6">Tutar</th>
                  <th className="px-4 py-3 sm:px-6">Kredi</th>
                  <th className="px-4 py-3 sm:px-6">Durum</th>
                  <th className="px-4 py-3 sm:px-6">Sağlayıcı</th>
                  <th className="px-4 py-3 sm:px-6">Tarih</th>
                  <th className="sticky right-0 z-10 min-w-[120px] bg-violet-50/95 px-4 py-3 text-right shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] sm:px-6">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-violet-50">
                    <td className="px-4 py-4 sm:px-6">
                      <p className="font-medium text-[var(--ink)]">{p.organization.name}</p>
                      <p className="text-xs text-[var(--ink-muted)]">{p.organization.slug}</p>
                    </td>
                    <td className="px-4 py-4 sm:px-6">{p.packageId}</td>
                    <td className="px-4 py-4 font-bold text-violet-700 sm:px-6">₺{p.amountTry.toLocaleString("tr-TR")}</td>
                    <td className="px-4 py-4 sm:px-6">{p.credits}</td>
                    <td className="px-4 py-4 sm:px-6">
                      <Badge variant={statusVariant(p.status)}>{statusLabel[p.status] || p.status}</Badge>
                    </td>
                    <td className="px-4 py-4 text-[var(--ink-muted)] sm:px-6">{p.provider}</td>
                    <td className="px-4 py-4 text-[var(--ink-muted)] sm:px-6">{formatDate(p.createdAt)}</td>
                    <td className="sticky right-0 z-10 bg-white px-4 py-4 text-right shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.06)] sm:px-6">
                      {canApprove(p) ? (
                        <Button
                          variant="accent"
                          className="whitespace-nowrap px-4 py-2 text-xs"
                          disabled={approving === p.id}
                          onClick={() => approve(p.id)}
                        >
                          {approving === p.id ? "Onaylanıyor…" : "Onayla"}
                        </Button>
                      ) : (
                        <span className="text-xs text-[var(--ink-muted)]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
