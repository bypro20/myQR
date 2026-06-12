import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { QR_TYPE_LABELS } from "@/lib/qr/types";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ScanLine, TrendingUp } from "lucide-react";

export default async function StatsPage() {
  const [totalScans, topQr, recentScans] = await Promise.all([
    prisma.qrScan.count(),
    prisma.qrCode.findMany({ orderBy: { scanCount: "desc" }, take: 10 }),
    prisma.qrScan.findMany({ orderBy: { scannedAt: "desc" }, take: 15, include: { qrCode: { select: { name: true } } } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Tarama İstatistikleri" description="Dinamik QR performans raporu — anonim veri" />
      <StatCard label="Toplam Tarama" value={totalScans} icon={ScanLine} tone="violet" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><div className="flex items-center gap-2 font-semibold text-violet-950"><TrendingUp className="h-4 w-4" /> En Çok Taranan</div></CardHeader>
          <CardBody className="space-y-3">{topQr.map((qr) => (
            <div key={qr.id} className="flex items-center justify-between border-b border-violet-50 pb-3 last:border-0">
              <div><p className="font-medium">{qr.name}</p><p className="text-xs text-slate-500">{QR_TYPE_LABELS[qr.type]}</p></div>
              <span className="text-lg font-bold text-violet-700">{qr.scanCount}</span>
            </div>
          ))}</CardBody>
        </Card>
        <Card>
          <CardHeader><p className="font-semibold text-violet-950">Son Taramalar</p></CardHeader>
          <CardBody className="space-y-3">{recentScans.map((s) => (
            <div key={s.id} className="border-b border-violet-50 pb-3 last:border-0 text-sm">
              <p className="font-medium">{s.qrCode.name}</p>
              <p className="text-slate-500">{s.deviceType} · {s.browser} · {s.os}</p>
              <p className="text-xs text-slate-400">{formatDate(s.scannedAt)}</p>
            </div>
          ))}</CardBody>
        </Card>
      </div>
    </div>
  );
}
