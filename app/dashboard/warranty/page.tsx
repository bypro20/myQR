import { prisma } from "@/lib/prisma";
import { requireTenant, orgWhere } from "@/lib/tenant";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function WarrantyPage() {
  const { organization } = await requireTenant();
  const items = await prisma.warrantyRegistration.findMany({
    where: { form: { qrCode: orgWhere(organization.id) } },
    include: { form: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Garanti Kayıtları" description="QR Garanti Aktivasyon Etiketi kayıtları" action={<a href="/api/warranty?export=csv"><Button variant="secondary">CSV Dışa Aktar</Button></a>} />
      <Card><CardBody className="overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-violet-50/50 text-left text-slate-500"><tr>
            <th className="px-6 py-3">Müşteri</th><th className="px-6 py-3">Ürün</th><th className="px-6 py-3">Seri No</th><th className="px-6 py-3">Telefon</th><th className="px-6 py-3">Tarih</th>
          </tr></thead>
          <tbody>{items.map((i) => (
            <tr key={i.id} className="border-t border-violet-50">
              <td className="px-6 py-4 font-medium">{i.customerName}</td>
              <td className="px-6 py-4">{i.productName}</td>
              <td className="px-6 py-4 font-mono text-xs">{i.serialNumber}</td>
              <td className="px-6 py-4">{i.phone}</td>
              <td className="px-6 py-4 text-slate-500">{formatDate(i.createdAt)}</td>
            </tr>
          ))}</tbody>
        </table>
      </CardBody></Card>
    </div>
  );
}
