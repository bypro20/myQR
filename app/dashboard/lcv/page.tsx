import { prisma } from "@/lib/prisma";
import { requireTenant, orgWhere } from "@/lib/tenant";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp, Users } from "lucide-react";

export default async function LcvPage() {
  const { organization } = await requireTenant();
  const orgFilter = orgWhere(organization.id);
  const items = await prisma.lcvRegistration.findMany({
    where: { form: { qrCode: orgFilter } },
    include: { form: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const attending = items.filter((i) => i.attendance === "Katılacağım").length;
  const notAttending = items.filter((i) => i.attendance === "Katılamayacağım").length;

  return (
    <div className="space-y-6">
      <PageHeader title="LCV / Katılım" description="Davetiye QR formlarından gelen yanıtlar" action={<a href="/api/lcv?export=csv"><Button variant="secondary">CSV Dışa Aktar</Button></a>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Toplam Yanıt" value={items.length} icon={Users} tone="violet" />
        <StatCard label="Katılacak" value={attending} icon={ThumbsUp} tone="emerald" />
        <StatCard label="Katılamayacak" value={notAttending} icon={ThumbsDown} tone="orange" />
      </div>
      <Card><CardBody className="overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-violet-50/50 text-left text-slate-500"><tr>
            <th className="px-6 py-3">Etkinlik</th><th className="px-6 py-3">Ad Soyad</th><th className="px-6 py-3">Katılım</th><th className="px-6 py-3">Kişi</th><th className="px-6 py-3">Tarih</th>
          </tr></thead>
          <tbody>{items.map((i) => (
            <tr key={i.id} className="border-t border-violet-50">
              <td className="px-6 py-4">{i.form.eventName}</td>
              <td className="px-6 py-4 font-medium">{i.fullName}</td>
              <td className="px-6 py-4"><Badge variant={i.attendance === "Katılacağım" ? "success" : "danger"}>{i.attendance}</Badge></td>
              <td className="px-6 py-4">{i.guestCount}</td>
              <td className="px-6 py-4 text-slate-500">{formatDate(i.createdAt)}</td>
            </tr>
          ))}</tbody>
        </table>
      </CardBody></Card>
    </div>
  );
}
