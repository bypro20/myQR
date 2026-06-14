import { prisma } from "@/lib/prisma";
import { requireTenant, orgWhere } from "@/lib/tenant";
import { QR_TYPE_LABELS } from "@/lib/qr/types";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function TemplatesPage() {
  const { organization } = await requireTenant();
  const items = await prisma.qrTemplate.findMany({
    where: { OR: [{ isSystem: true }, { organizationId: organization.id }] },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="QR Şablonları" description="QRBaskı ürün kataloğuna uygun 25 hazır şablon" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((t) => (
          <Card key={t.id} className="card-hover">
            <CardBody>
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-violet-950">{t.name}</h2>
                <Badge>{QR_TYPE_LABELS[t.qrType]}</Badge>
              </div>
              <div className="mt-4 space-y-1 text-sm text-slate-500">
                {t.dimensions ? <p>Ölçü: <span className="font-medium text-slate-700">{t.dimensions}</span></p> : null}
                {t.printFormat ? <p>Format: <span className="font-medium text-slate-700">{t.printFormat}</span></p> : null}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
