import { buildMetadata } from "@/lib/seo/metadata";
import { landingPageJsonLd, freeTrialNote } from "@/lib/seo/json-ld";
import { SeoLandingLayout } from "@/components/seo/seo-landing-layout";
import { MARKETING_IMAGES } from "@/lib/marketing/visuals";

const DESCRIPTION =
  "Restoran ve kafe için dijital menü QR kodu. Dinamik menü linki, tarama analitiği ve aylık/yıllık süre paketleri. Menüyü baskıyı yenilemeden güncelleyin.";

export const metadata = buildMetadata({
  title: "Restoran Menü QR Kod",
  description: DESCRIPTION,
  path: "/restoran-menu-qr",
  keywords: [
    "restoran menü qr",
    "kafe qr menü",
    "dijital menü qr kod",
    "qr menü oluştur",
    "restoran qr kod",
  ],
});

const faqs = [
  {
    question: "Restoran menü QR kodu nasıl çalışır?",
    answer:
      "Masaya veya vitrine basılan QR kod tarandığında müşteri dijital menünüze yönlendirilir. Menü linkini panelden değiştirdiğinizde aynı QR kod yeni menüyü gösterir.",
  },
  {
    question: "Menü fiyatlarını güncellemek için yeni QR basmam gerekir mi?",
    answer:
      "Hayır. Dinamik QR kullanıyorsanız hedef URL aynı kalır; PDF veya web menünüzü güncellediğinizde QR değişmeden yeni içeriği gösterir.",
  },
  {
    question: "Hangi süre paketi restoranlar için uygun?",
    answer:
      "Sürekli açık restoranlar için aylık veya yıllık paket; pop-up ve sezonluk işletmeler için haftalık paket uygundur. Kalıcı lisans matbaa baskısı için idealdir.",
  },
];

export default function RestoranMenuQrPage() {
  return (
    <SeoLandingLayout
      badge="Restoran & Kafe"
      title={
        <>
          Restoran menü QR —{" "}
          <span className="text-gradient">dijital menü, anında güncelleme</span>
        </>
      }
      subtitle={`Masada, vitrinde ve paket serviste dijital menü QR kodu. ${freeTrialNote()}.`}
      features={[
        "Dinamik menü linki — fiyat değişince QR aynı kalır",
        "Wi-Fi, WhatsApp ve Google yorum QR formatları da dahil",
        "Tarama analitiği ile yoğun saatleri ölçün",
        "Aylık, yıllık ve kalıcı süre paketleri",
        "15 gün ücretsiz deneme ile hemen test edin",
      ]}
      faqs={faqs}
      jsonLd={landingPageJsonLd({
        path: "/restoran-menu-qr",
        title: "Restoran Menü QR Kod",
        description: DESCRIPTION,
        faqs,
      })}
      primaryCta="Menü QR oluştur"
      heroImage={{
        src: MARKETING_IMAGES.restaurantMenu,
        alt: "Restoran menü QR kodu — dijital menü ve anında güncelleme",
        caption: "Masada QR ile dijital menü — baskıyı yenilemeden güncelleyin",
      }}
    />
  );
}
