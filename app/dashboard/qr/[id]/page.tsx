import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QrForm } from "@/components/qr/qr-form";
import { getAppUrl } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";

type Props = { params: Promise<{ id: string }> };

export default async function EditQrPage({ params }: Props) {
  const { id } = await params;
  const qr = await prisma.qrCode.findUnique({ where: { id } });
  if (!qr) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={qr.name} description="QR ayarlarını düzenleyin ve baskı çıktısı alın" />
      {qr.shortCode ? (
        <Card><CardBody className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">Kısa link:</span>
          <code className="rounded-lg bg-violet-50 px-3 py-1.5 font-mono text-violet-800">{getAppUrl()}/q/{qr.shortCode}</code>
        </CardBody></Card>
      ) : null}
      <QrForm qrId={qr.id} shortCode={qr.shortCode} initial={qr as unknown as Record<string, unknown>} />
    </div>
  );
}
