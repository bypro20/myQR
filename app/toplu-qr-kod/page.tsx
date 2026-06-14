import { buildMetadata } from "@/lib/seo/metadata";
import { landingPageJsonLd, freeTrialNote } from "@/lib/seo/json-ld";
import { SeoLandingLayout } from "@/components/seo/seo-landing-layout";

const DESCRIPTION =
  "CSV ile yüzlerce QR kodu tek seferde oluşturun, ZIP indirin. Matbaa ve ajanslar için toplu QR üretim platformu — dinamik ve statik kod desteği.";

export const metadata = buildMetadata({
  title: "Toplu QR Kod Üretimi",
  description: DESCRIPTION,
  path: "/toplu-qr-kod",
  keywords: [
    "toplu qr kod",
    "toplu qr kod oluşturma",
    "csv qr kod",
    "matbaa qr toplu",
    "qr kod zip indir",
  ],
});

const faqs = [
  {
    question: "Toplu QR kod nasıl oluşturulur?",
    answer:
      "CSV dosyanızdaki satırları yükleyin; sistem her satır için QR kod üretir ve ZIP arşivi olarak indirmenizi sağlar. Matbaa sürecine doğrudan aktarabilirsiniz.",
  },
  {
    question: "Kaç QR kodu aynı anda üretebilirim?",
    answer:
      "Pro plan ve üzerinde toplu üretim modülü açıktır. Her satır kredi tüketir; bakiyeniz kadar satır işleyebilirsiniz.",
  },
  {
    question: "Toplu QR dinamik olabilir mi?",
    answer:
      "Evet. Toplu üretimde dinamik QR oluşturabilir; her kod için panelden hedef güncellemesi yapabilirsiniz.",
  },
];

export default function TopluQrKodPage() {
  return (
    <SeoLandingLayout
      badge="Toplu QR Üretim"
      title={
        <>
          Toplu QR kod —{" "}
          <span className="text-gradient">CSV ile yüzlerce kod</span>
        </>
      }
      subtitle={`Matbaa ve ajanslar için CSV tabanlı toplu QR üretimi. ZIP indirme, dinamik yönlendirme. ${freeTrialNote()}.`}
      features={[
        "CSV yükle → otomatik QR üretimi → ZIP indir",
        "Statik ve dinamik mod desteği",
        "Müşteri adı, etiket ve kısa kod yönetimi",
        "Matbaa baskı formatlarına uygun PNG/SVG/PDF export",
        "Pro plan ile sınırsız ölçeklenebilir iş akışı",
      ]}
      faqs={faqs}
      jsonLd={landingPageJsonLd({
        path: "/toplu-qr-kod",
        title: "Toplu QR Kod Üretimi",
        description: DESCRIPTION,
        faqs,
      })}
    />
  );
}
