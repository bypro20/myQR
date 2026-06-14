import { buildMetadata } from "@/lib/seo/metadata";
import { landingPageJsonLd, freeTrialNote } from "@/lib/seo/json-ld";
import { SeoLandingLayout } from "@/components/seo/seo-landing-layout";
import { MARKETING_IMAGES } from "@/lib/marketing/visuals";

const DESCRIPTION =
  "Matbaa ve baskı atölyeleri için QR kod platformu. Toplu üretim, kalıcı QR lisansı, müşteri paneli ve indirimli bayi kredisi. QR hizmetinizi ölçeklendirin.";

export const metadata = buildMetadata({
  title: "Matbaa QR Kod Çözümü",
  description: DESCRIPTION,
  path: "/qr-kod-matbaa",
  keywords: [
    "matbaa qr kod",
    "baskı qr kod",
    "matbaa qr yazılımı",
    "qr kod bayi",
    "kalıcı qr kod matbaa",
  ],
});

const faqs = [
  {
    question: "Matbaa için kalıcı QR kod var mı?",
    answer:
      "Evet. Kalıcı (süresiz) QR lisansı matbaa müşterileri için idealdir — bir kez ödenir, QR sonsuza kadar aktif kalır. Dinamik hedef güncellemesi de yapılabilir.",
  },
  {
    question: "Müşterilerime ayrı panel verebilir miyim?",
    answer:
      "Panel kiralama programı ile her müşterinize ayrı panel açabilir, indirimli toptan kredi alarak kendi fiyatınızla QR hizmeti satabilirsiniz.",
  },
  {
    question: "Toplu baskı çıktısı alabilir miyim?",
    answer:
      "CSV ile toplu QR üretip ZIP indirebilir; PNG, SVG ve PDF formatlarında matbaa sürecine uygun çıktı alabilirsiniz.",
  },
];

export default function QrKodMatbaaPage() {
  return (
    <SeoLandingLayout
      badge="Matbaa & Baskı"
      title={
        <>
          Matbaa QR kod —{" "}
          <span className="text-gradient">müşterinize satın, gelir elde edin</span>
        </>
      }
      subtitle={`Baskı atölyeleri için toplu QR, kalıcı lisans ve bayi paneli. ${freeTrialNote()}.`}
      features={[
        "Toplu CSV → ZIP — yüzlerce QR tek seferde",
        "Kalıcı QR lisansı matbaa müşterileri için",
        "Panel kiralama ile müşteri başına ayrı hesap",
        "Dinamik QR — müşteri baskıyı yenilemeden link günceller",
        "iyzico / FAST ile güvenli ödeme altyapısı",
      ]}
      faqs={faqs}
      jsonLd={landingPageJsonLd({
        path: "/qr-kod-matbaa",
        title: "Matbaa QR Kod Çözümü",
        description: DESCRIPTION,
        faqs,
      })}
      primaryCta="Matbaa hesabı aç"
      heroImage={{
        src: MARKETING_IMAGES.printHouse,
        alt: "Matbaa QR kod üretim hattı ve abonelik kiti",
        caption: "Bir kez basın, sürekli gelir — matbaa için QR abonelik modeli",
      }}
      showcaseImage={{
        src: MARKETING_IMAGES.qrRevenue,
        alt: "QR kodlarınızı gelir kaynağına dönüştürün",
        title: "Matbaanızı geleceğe taşıyın",
        subtitle: "Toplu üretim, müşteri paneli ve sürekli gelir modeli.",
        caption: "Müşterilerinize QR hizmeti sunun, her yenilemede tekrarlayan gelir elde edin",
      }}
    />
  );
}
