"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, Building2, QrCode, Radio, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

type Overview = {
  permissions?: string[];
  stats: {
    users: number | null;
    organizations: number | null;
    qrCodes: number | null;
    revenueTry: number | null;
  };
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    credits: number;
    planTier: string;
    createdAt: string;
    _count: { qrCodes: number; memberships: number };
  }>;
  users: Array<{ id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string }>;
  payments: Array<{ id: string; amountTry: number; credits: number; status: string; createdAt: string; organization: { name: string } }>;
};

export function AdminOverview() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <p className="text-[var(--ink-muted)]">Yükleniyor…</p>;

  const canViewActivity = data.permissions?.includes("activity_view") ?? false;

  const statCards = [
    data.stats.users !== null ? { label: "Kullanıcı", value: data.stats.users, icon: Activity, tone: "violet" as const } : null,
    data.stats.organizations !== null ? { label: "Organizasyon", value: data.stats.organizations, icon: Building2, tone: "sky" as const } : null,
    data.stats.qrCodes !== null ? { label: "QR Kod", value: data.stats.qrCodes, icon: QrCode, tone: "emerald" as const } : null,
    data.stats.revenueTry !== null ? { label: "Gelir (₺)", value: data.stats.revenueTry.toLocaleString("tr-TR"), icon: TrendingUp, tone: "orange" as const } : null,
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Genel Bakış"
        description="Yetkiniz dahilindeki platform verilerinin özeti — kullanıcılar ve finans"
        action={
          canViewActivity ? (
          <Link href="/admin/activity">
            <Button variant="accent">
              <Radio className="h-4 w-4" />
              Canlı Aktivite
            </Button>
          </Link>
          ) : undefined
        }
      />

      {statCards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((s) => s && (
            s.label === "QR Kod" ? (
              <Link key={s.label} href="/admin/qr-codes" className="block transition hover:scale-[1.02]">
                <StatCard label={s.label} value={s.value} icon={s.icon} tone={s.tone} />
              </Link>
            ) : (
              <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} tone={s.tone} />
            )
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {data.users.length > 0 ? (
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-[var(--ink)]">Son Kayıt Olan Kullanıcılar</h2>
            </CardHeader>
            <CardBody className="space-y-3 p-0">
              {data.users.slice(0, 6).map((u) => (
                <div key={u.id} className="flex items-center justify-between border-t border-violet-50 px-6 py-3 first:border-t-0">
                  <div>
                    <p className="font-medium text-[var(--ink)]">{u.name}</p>
                    <p className="text-xs text-[var(--ink-muted)]">{u.email}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {u.isActive ? u.role : "Pasif"}
                  </span>
                </div>
              ))}
            </CardBody>
          </Card>
        ) : null}

        {data.payments.length > 0 ? (
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-[var(--ink)]">Son Ödemeler</h2>
            </CardHeader>
            <CardBody className="space-y-3 p-0">
              {data.payments.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center justify-between border-t border-violet-50 px-6 py-3 first:border-t-0">
                  <div>
                    <p className="font-medium text-[var(--ink)]">{p.organization.name}</p>
                    <p className="text-xs text-[var(--ink-muted)]">{formatDate(p.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-violet-700">₺{p.amountTry}</p>
                    <p className="text-xs text-[var(--ink-muted)]">{p.status}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        ) : null}
      </div>

      {data.organizations.length > 0 ? (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--ink)]">Organizasyonlar</h2>
            <span className="text-xs text-[var(--ink-muted)]">{data.organizations.length} kayıt</span>
          </CardHeader>
          <CardBody className="overflow-x-auto p-0">
            <table className="min-w-full text-sm">
              <thead className="bg-violet-50/50 text-left text-[var(--ink-muted)]">
                <tr>
                  <th className="px-6 py-3">Organizasyon</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Kredi</th>
                  <th className="px-6 py-3">QR</th>
                  <th className="px-6 py-3">Üye</th>
                  <th className="px-6 py-3">Kayıt</th>
                </tr>
              </thead>
              <tbody>
                {data.organizations.map((o) => (
                  <tr key={o.id} className="border-t border-violet-50">
                    <td className="px-6 py-4 font-medium text-[var(--ink)]">{o.name}</td>
                    <td className="px-6 py-4">{o.planTier}</td>
                    <td className="px-6 py-4 font-semibold text-amber-700">{o.credits}</td>
                    <td className="px-6 py-4">{o._count.qrCodes}</td>
                    <td className="px-6 py-4">{o._count.memberships}</td>
                    <td className="px-6 py-4 text-[var(--ink-muted)]">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
