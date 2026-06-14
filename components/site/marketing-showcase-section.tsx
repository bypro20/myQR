import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MARKETING_IMAGES } from "@/lib/marketing/visuals";

const showcases = [
  {
    image: MARKETING_IMAGES.restaurantMenu,
    alt: "Restoran menü QR kodu",
    title: "Restoran & kafe",
    desc: "Dijital menü, anında güncelleme",
    href: "/restoran-menu-qr",
  },
  {
    image: MARKETING_IMAGES.printHouse,
    alt: "Matbaa QR abonelik sistemi",
    title: "Matbaa & baskı",
    desc: "Toplu üretim, sürekli gelir",
    href: "/qr-kod-matbaa",
  },
  {
    image: MARKETING_IMAGES.campaignWarehouse,
    alt: "Kampanya ve ödeme QR yönetimi",
    title: "Kampanya & ödeme",
    desc: "WhatsApp, IBAN ve kampanya QR",
    href: "/dinamik-qr-kod",
  },
  {
    image: MARKETING_IMAGES.whiteLabelPartner,
    alt: "White-label iş ortağı programı",
    title: "İş ortağı",
    desc: "Panel kiralama, bayi yönetimi",
    href: "/panel-kiralama",
  },
];

export function MarketingShowcaseSection() {
  return (
    <section className="section-pad border-b border-[var(--line)] bg-white">
      <div className="site-container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-badge">Gerçek kullanım senaryoları</span>
          <h2 className="section-title mt-4 text-[var(--ink)]">
            Her sektör için{" "}
            <span className="text-gradient">profesyonel QR çözümü</span>
          </h2>
          <p className="section-sub mx-auto">
            Restorandan matbaaya, kampanyadan bayi ağına — myQR ile işinizi dijitalleştirin ve gelir elde edin.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {showcases.map(({ image, alt, title, desc, href }) => (
            <Link
              key={href}
              href={href}
              className="group card-glow card-hover relative overflow-hidden rounded-3xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={image}
                  alt={alt}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0118]/90 via-[#0c0118]/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">{title}</p>
                  <p className="mt-1 text-lg font-bold text-white">{desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-fuchsia-200 transition group-hover:gap-2">
                    Detayları gör <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
