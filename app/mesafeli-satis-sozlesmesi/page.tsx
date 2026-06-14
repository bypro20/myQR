import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/site/legal-layout";
import { CREDIT_PACKAGES } from "@/lib/billing/packages";
import { PLANS } from "@/lib/plans";
import { formatCompanyAddress, getCompanyInfo } from "@/lib/company-info";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Mesafeli Satış Sözleşmesi",
  description: "myQR dijital QR kod hizmeti mesafeli satış sözleşmesi — abonelik ve kredi paketleri.",
  path: "/mesafeli-satis-sozlesmesi",
});

export default function DistanceSalesPage() {
  const c = getCompanyInfo();
  const address = formatCompanyAddress(c);

  return (
    <LegalLayout
      title="Mesafeli Satış Sözleşmesi"
      description="6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında düzenlenmiştir."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">Madde 1 — Taraflar</h2>
        <p>
          <strong>Satıcı:</strong>
          <br />
          Unvan / Ad Soyad: {c.legalName}
          <br />
          Ticari marka: {c.tradeName}
          <br />
          Adres: {address}
          <br />
          E-posta: {c.email}
          {c.phone ? (
            <>
              <br />
              Telefon: {c.phone}
            </>
          ) : null}
          {c.kep ? (
            <>
              <br />
              KEP: {c.kep}
            </>
          ) : null}
        </p>
        <p>
          <strong>Alıcı:</strong> Platforma kayıt olan ve hizmet satın alan gerçek veya tüzel kişi.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">Madde 2 — Sözleşmenin konusu</h2>
        <p>
          İşbu sözleşme, Alıcı&apos;nın {c.website} üzerinden elektronik ortamda sipariş verdiği dijital
          yazılım hizmetlerinin (abonelik planları, kredi paketleri) satışına ve teslimine ilişkin
          tarafların hak ve yükümlülüklerini düzenler.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">Madde 3 — Hizmet ve fiyat bilgileri</h2>
        <p>Satışa sunulan dijital hizmetler ve güncel fiyatları:</p>
        <ul className="list-disc space-y-2 pl-5">
          {PLANS.filter((p) => p.id !== "FREE").map((plan) => (
            <li key={plan.id}>
              {plan.name} abonelik planı — {plan.priceTry.toLocaleString("tr-TR")} ₺ / {plan.period}
            </li>
          ))}
          {CREDIT_PACKAGES.map((pkg) => (
            <li key={pkg.id}>
              {pkg.name} kredi paketi ({pkg.credits + pkg.bonus} kredi) —{" "}
              {pkg.priceTry.toLocaleString("tr-TR")} ₺
            </li>
          ))}
        </ul>
        <p>
          Fiyatlar KDV dahil olarak gösterilir. Güncel liste:{" "}
          <Link href="/pricing" className="link-brand">
            /pricing
          </Link>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">Madde 4 — Ödeme</h2>
        <p>
          Ödeme; kredi kartı, banka kartı, Troy kartı veya FAST/havale yoluyla alınabilir. Kart
          ödemeleri 3D Secure güvenli ödeme altyapısı üzerinden gerçekleştirilir. Kart bilgileri
          Satıcı tarafından saklanmaz.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">Madde 5 — Teslimat</h2>
        <p>
          Dijital hizmetler, ödemenin onaylanmasının ardından Alıcı&apos;nın panel hesabına anında
          tanımlanır. Fiziksel teslimat söz konusu değildir.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">Madde 6 — Cayma hakkı</h2>
        <p>
          Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi (ğ) bendi uyarınca, elektronik ortamda
          anında ifa edilen dijital içerik ve hizmetlerde, tüketicinin onayı ile ifaya başlandığında
          cayma hakkı kullanılamaz. Alıcı, ödeme onayı ile hizmetin anında başlatılmasını kabul eder.
        </p>
        <p>
          Detaylı iade koşulları için{" "}
          <Link href="/teslimat-iade" className="link-brand">
            Teslimat ve İade Şartları
          </Link>{" "}
          sayfasına bakınız.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">Madde 7 — Uyuşmazlık</h2>
        <p>
          Uyuşmazlıklarda Alıcı, Tüketici Hakem Heyetlerine ve Tüketici Mahkemelerine başvurabilir.
          Şikâyet ve itirazlar için {c.email} adresine başvurulabilir.
        </p>
      </section>

      <p className="text-sm">
        Alıcı, siparişi onaylamadan önce bu sözleşmeyi okuduğunu ve kabul ettiğini beyan eder.
      </p>
    </LegalLayout>
  );
}
