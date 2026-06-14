import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTenant, orgWhere } from "@/lib/tenant";
import { formatDate, getAppUrlFromRequest } from "@/lib/utils";
import { QR_TYPE_LABELS } from "@/lib/qr/types";
import { expiryStatus, durationTierLabel } from "@/lib/qr/duration";
import { QrExpiryBanner } from "@/components/qr/qr-expiry-banner";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = { searchParams: Promise<{ q?: string; type?: string; mode?: string }> };

export default async function QrListPage({ searchParams }: Props) {
  const { organization } = await requireTenant();
  const params = await searchParams;
  const q = params.q?.trim();
  const where = {
    ...orgWhere(organization.id),
    ...(q ? { OR: [{ name: { contains: q } }, { customerName: { contains: q } }, { shortCode: { contains: q } }] } : {}),
    ...(params.type ? { type: params.type as never } : {}),
    ...(params.mode ? { mode: params.mode as never } : {}),
  };
  const items = await prisma.qrCode.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
  const appUrl = await getAppUrlFromRequest();

  const expiring = items
    .map((qr) => {
      const exp = expiryStatus(qr.expiresAt, qr.durationTier);
      if (exp.state === "permanent" || exp.state === "active") return null;
      return { id: qr.id, name: qr.name, state: exp.state, label: exp.label };
    })
    .filter(Boolean) as { id: string; name: string; state: "expired" | "critical" | "warning"; label: string }[];

  return (
    <div className="space-y-6">
      <PageHeader title="QR Kodlar" description="Tüm QR kayıtlarınızı filtreleyin, düzenleyin ve indirin" actionHref="/dashboard/qr/new" actionLabel="Yeni QR" />

      <QrExpiryBanner items={expiring} />

      <Card>
        <CardBody>
          <form method="get" className="grid gap-3 md:grid-cols-4">
            <Input name="q" defaultValue={q} placeholder="Ad, müşteri veya kısa kod ara..." className="md:col-span-2" />
            <Select name="type" defaultValue={params.type || ""}>
              <option value="">Tüm tipler</option>
              {Object.entries(QR_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Select name="mode" defaultValue={params.mode || ""}>
              <option value="">Tüm modlar</option>
              <option value="DYNAMIC">Dinamik</option>
              <option value="STATIC">Statik</option>
            </Select>
            <Button type="submit" variant="secondary" className="md:max-w-[120px]">Filtrele</Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-violet-50/50 text-left text-slate-500">
              <tr>
                <th className="px-6 py-3">Ad</th>
                <th className="px-6 py-3">Tip</th>
                <th className="px-6 py-3">Mod</th>
                <th className="px-6 py-3">Kısa Link</th>
                <th className="px-6 py-3">Tarama</th>
                <th className="px-6 py-3">Süre</th>
                <th className="px-6 py-3">Durum</th>
                <th className="px-6 py-3">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {items.map((qr) => {
                const exp = expiryStatus(qr.expiresAt, qr.durationTier);
                return (
                <tr key={qr.id} className="border-t border-violet-50">
                  <td className="px-6 py-4"><Link href={`/dashboard/qr/${qr.id}`} className="font-semibold text-violet-700 hover:underline">{qr.name}</Link></td>
                  <td className="px-6 py-4">{QR_TYPE_LABELS[qr.type]}</td>
                  <td className="px-6 py-4"><Badge variant={qr.mode === "DYNAMIC" ? "default" : "muted"}>{qr.mode === "DYNAMIC" ? "Dinamik" : "Statik"}</Badge></td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{qr.shortCode ? `${appUrl}/q/${qr.shortCode}` : "—"}</td>
                  <td className="px-6 py-4 font-medium">{qr.scanCount}</td>
                  <td className="px-6 py-4">
                    <Badge variant={exp.variant}>{exp.label}</Badge>
                    <p className="mt-0.5 text-[10px] text-slate-400">{durationTierLabel(qr.durationTier)}</p>
                  </td>
                  <td className="px-6 py-4"><Badge variant={qr.isActive ? "success" : "danger"}>{qr.isActive ? "Aktif" : "Pasif"}</Badge></td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(qr.createdAt)}</td>
                </tr>
              );})}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
