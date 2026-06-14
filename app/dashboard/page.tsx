import Link from "next/link";
import { Activity, Coins, Plus, QrCode, ScanLine, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTenant, orgWhere } from "@/lib/tenant";
import { formatDate } from "@/lib/utils";
import { QR_TYPE_LABELS } from "@/lib/qr/types";
import { expiryStatus } from "@/lib/qr/duration";
import { getEffectivePlanTier } from "@/lib/billing/pricing-config";
import { getPlan } from "@/lib/plans";
import { QrExpiryBanner } from "@/components/qr/qr-expiry-banner";
import { OnboardingBanner } from "@/components/dashboard/onboarding-banner";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const { organization } = await requireTenant();
  const orgFilter = orgWhere(organization.id);
  const effectiveTier = getEffectivePlanTier(organization);
  const plan = getPlan(effectiveTier);

  const [totalQr, activeQr, dynamicQr, totalScans, recent, allQr] = await Promise.all([
    prisma.qrCode.count({ where: orgFilter }),
    prisma.qrCode.count({ where: { ...orgFilter, isActive: true } }),
    prisma.qrCode.count({ where: { ...orgFilter, mode: "DYNAMIC" } }),
    prisma.qrScan.count({ where: { qrCode: orgFilter } }),
    prisma.qrCode.findMany({ where: orgFilter, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.qrCode.findMany({
      where: { ...orgFilter, expiresAt: { not: null }, durationTier: { not: "PERMANENT" } },
      select: { id: true, name: true, expiresAt: true, durationTier: true },
    }),
  ]);

  const expiring = allQr
    .map((qr) => {
      const exp = expiryStatus(qr.expiresAt, qr.durationTier);
      if (exp.state === "permanent" || exp.state === "active") return null;
      return { id: qr.id, name: qr.name, state: exp.state, label: exp.label };
    })
    .filter(Boolean) as { id: string; name: string; state: "expired" | "critical" | "warning"; label: string }[];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Merhaba, ${organization.name}`}
        description={`${plan.name} planınız aktif · ${organization.credits.toLocaleString("tr-TR")} kredi kullanılabilir — yeni QR oluşturmaya hazırsınız.`}
        actionHref="/dashboard/qr/new"
        actionLabel="Yeni QR Oluştur"
      />

      <QrExpiryBanner items={expiring}       />

      <OnboardingBanner qrCount={totalQr} credits={organization.credits} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Kredi" value={organization.credits} icon={Coins} tone="orange" />
        <StatCard label="Toplam QR" value={totalQr} icon={QrCode} tone="violet" />
        <StatCard label="Aktif QR" value={activeQr} icon={Zap} tone="emerald" />
        <StatCard label="Dinamik QR" value={dynamicQr} icon={Activity} tone="sky" />
        <StatCard label="Toplam Tarama" value={totalScans} icon={ScanLine} tone="violet" />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-semibold text-violet-950">Son QR Kayıtları</h2>
          <Link href="/dashboard/qr" className="text-sm font-medium text-violet-600 hover:underline">Tümünü gör</Link>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-violet-50/50 text-left text-slate-500">
              <tr>
                <th className="px-6 py-3">Ad</th>
                <th className="px-6 py-3">Tip</th>
                <th className="px-6 py-3">Mod</th>
                <th className="px-6 py-3">Tarama</th>
                <th className="px-6 py-3">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  Henüz QR yok. <Link href="/dashboard/qr/new" className="text-violet-600 hover:underline">İlk QR&apos;ınızı oluşturun</Link>
                </td></tr>
              ) : recent.map((qr) => (
                <tr key={qr.id} className="border-t border-violet-50">
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/qr/${qr.id}`} className="font-semibold text-violet-700 hover:underline">{qr.name}</Link>
                  </td>
                  <td className="px-6 py-4">{QR_TYPE_LABELS[qr.type] || qr.type}</td>
                  <td className="px-6 py-4"><Badge variant={qr.mode === "DYNAMIC" ? "default" : "muted"}>{qr.mode === "DYNAMIC" ? "Dinamik" : "Statik"}</Badge></td>
                  <td className="px-6 py-4 font-medium">{qr.scanCount}</td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(qr.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
