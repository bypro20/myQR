import { requirePartner } from "@/lib/partner";
import { PartnerCustomersPanel } from "@/components/partner/partner-customers-panel";

export default async function PartnerCustomersPage() {
  await requirePartner();
  return <PartnerCustomersPanel />;
}
