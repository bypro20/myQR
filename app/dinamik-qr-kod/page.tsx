import { buildMetadata } from "@/lib/seo/metadata";
import { landingPageJsonLd, freeTrialNote } from "@/lib/seo/json-ld";
import { SeoLandingLayout } from "@/components/seo/seo-landing-layout";

const DESCRIPTION =
  "Dinamik QR kod ile baskıyı yenilemeden hedefi güncelleyin. Menü, kampanya ve kartvizit için profesyonel QR platformu. Canlı analitik ve süre paketleri.";

export const metadata = buildMetadata({
  title: "Dinamik QR Kod Oluştur",
  description: DESCRIPTION,
  path: "/dinamik-qr-kod",
  keywords: [
    "dinamik qr kod",
    "dinamik qr kod oluştur",
    "qr kod yönlendirme",
    "qr kod güncelleme",
    "canlı qr kod",
  ],
});

const faqs = [
  {
    question: "Dinamik QR kod nedir?",
    answer:
      "Dinamik QR kod, basılı kod aynı kalırken arka plandaki hedef URL veya içeriği panelden değiştirmenizi sağlar. Matbaa baskısı yenilenmeden menü, kampanya veya fiyat güncellemesi yapabilirsiniz.",
  },
  {
    question: "Dinamik QR kod fiyatı ne kadar?",
    answer:
      "Dinamik QR oluşturma 3 kredi taban ücreti + süre lisansı gerektirir. 15 gün ücretsiz deneme sunulur; süre bitince tarama durur ve paket ile uzatılır. Detaylar fiyatlandırma sayfasında.",
  },
  {
    question: "Tarama istatistiklerini görebilir miyim?",
    answer:
      "Evet. Pro deneme ve üst planlarda kim, ne zaman ve hangi cihazdan taradı bilgisini canlı analitik panelinden izleyebilirsiniz.",
  },
];

export default function DinamikQrKodPage() {
  return (
    <SeoLandingLayout
      badge="Dinamik QR Kod"
      title={
        <>
          Dinamik QR kod —{" "}
          <span className="text-gradient">baskıyı yenilemeden güncelleyin</span>
        </>
      }
      subtitle={`Restoran menüsü, kampanya linki veya kartvizit için dinamik QR oluşturun. ${freeTrialNote()}.`}
      features={[
        "Baskı sabit kalır — hedef link panelden anında değişir",
        "Tarama sayısı, cihaz ve zaman analitiği",
        "Haftalık, aylık, yıllık ve kalıcı süre paketleri",
        "45+ format: URL, WhatsApp, vCard, Wi-Fi, IBAN ve daha fazlası",
        "Süresi dolunca otomatik tarama engeli — profesyonel gelir modeli",
      ]}
      faqs={faqs}
      jsonLd={landingPageJsonLd({
        path: "/dinamik-qr-kod",
        title: "Dinamik QR Kod Oluştur",
        description: DESCRIPTION,
        faqs,
      })}
    />
  );
}
