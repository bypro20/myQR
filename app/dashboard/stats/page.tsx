import { prisma } from "@/lib/prisma";
import { requireTenant, orgWhere } from "@/lib/tenant";
import { QR_TYPE_LABELS } from "@/lib/qr/types";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ScanLine, TrendingUp } from "lucide-react";

export default async function StatsPage() {
  const { organization } = await requireTenant();
  const orgFilter = orgWhere(organization.id);
  const [totalScans, topQr] = await Promise.all([
    prisma.qrScan.count({ where: { qrCode: orgFilter } }),
    prisma.qrCode.findMany({ where: orgFilter, orderBy: { scanCount: "desc" }, take: 10 }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarama İstatistikleri"
        description="Yalnızca kendi QR kodlarınıza ait özet performans — başka kullanıcıların verisi görünmez"
      />
      <StatCard label="Toplam Tarama" value={totalScans} icon={ScanLine} tone="violet" />
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 font-semibold text-violet-950">
            <TrendingUp className="h-4 w-4" /> En Çok Taranan QR Kodlarınız
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          {topQr.length === 0 ? (
            <p className="text-sm text-slate-500">Henüz tarama verisi yok.</p>
          ) : (
            topQr.map((qr) => (
              <div key={qr.id} className="flex items-center justify-between border-b border-violet-50 pb-3 last:border-0">
                <div>
                  <p className="font-medium">{qr.name}</p>
                  <p className="text-xs text-slate-500">{QR_TYPE_LABELS[qr.type]}</p>
                </div>
                <span className="text-lg font-bold text-violet-700">{qr.scanCount}</span>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
