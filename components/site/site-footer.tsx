import Link from "next/link";
import { QrCode } from "lucide-react";
import { SmartPaymentBadges } from "@/components/site/smart-payment-badges";
import { getCompanyInfo } from "@/lib/company-info";

const product = [
  { href: "/#ozellikler", label: "Özellikler" },
  { href: "/pricing", label: "Fiyatlandırma" },
  { href: "/panel-kiralama", label: "Panel Kiralama" },
];

const solutions = [
  { href: "/dinamik-qr-kod", label: "Dinamik QR" },
  { href: "/toplu-qr-kod", label: "Toplu QR" },
  { href: "/qr-kod-matbaa", label: "Matbaa" },
  { href: "/restoran-menu-qr", label: "Restoran Menü" },
];

const companyNav = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

const legal = [
  { href: "/gizlilik-politikasi", label: "Gizlilik" },
  { href: "/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış" },
  { href: "/teslimat-iade", label: "Teslimat & İade" },
  { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
];

export function SiteFooter() {
  const companyInfo = getCompanyInfo();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 text-slate-300" style={{ background: "var(--gradient-dark)" }}>
      <div className="aurora opacity-40">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-3" />
      </div>
      <div className="site-container relative grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="logo-box h-10 w-10">
              <QrCode className="h-5 w-5" />
            </span>
            <span className="text-xl font-extrabold text-white">
              my<span className="text-gradient">QR</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            Matbaa, ajans ve perakende için profesyonel QR üretim, yönetim ve analiz platformu.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-300/80">Ürün</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {product.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-300/80">Çözümler</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {solutions.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-300/80">Kurumsal</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {companyNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={`mailto:${companyInfo.email}`} className="transition hover:text-white hover:underline">
                {companyInfo.email}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-300/80">Yasal</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-white hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10 px-5 py-8">
        <SmartPaymentBadges className="mx-auto" size="sm" />
        <p className="site-container mt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} myQR · Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
