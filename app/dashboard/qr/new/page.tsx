import { QrForm } from "@/components/qr/qr-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewQrPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Yeni QR Oluştur" description="QRBaskı ürünleriniz için baskıya hazır QR kod üretin" />
      <QrForm />
    </div>
  );
}
