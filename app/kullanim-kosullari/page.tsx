import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/site/legal-layout";
import { getCompanyInfo } from "@/lib/company-info";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Kullanım Koşulları",
  description: "myQR platform kullanım şartları, hizmet koşulları ve kullanıcı yükümlülükleri.",
  path: "/kullanim-kosullari",
});

export default function TermsPage() {
  const c = getCompanyInfo();

  return (
    <LegalLayout
      title="Kullanım Koşulları"
      description={`${c.tradeName} platformunu kullanmadan önce lütfen bu koşulları okuyunuz.`}
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">1. Kabul</h2>
        <p>
          {c.website} adresindeki hizmetleri kullanarak bu koşulları kabul etmiş sayılırsınız. Koşulları
          kabul etmiyorsanız platformu kullanmayınız.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">2. Hizmet tanımı</h2>
        <p>{c.serviceDescription}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">3. Hesap ve güvenlik</h2>
        <p>
          Hesap bilgilerinizin gizliliğinden siz sorumlusunuz. Yetkisiz kullanım şüphesinde derhal{" "}
          {c.email} adresine bildirin.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">4. Kabul edilemez kullanım</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Yasa dışı, zararlı veya yanıltıcı QR içerikleri</li>
          <li>Üçüncü kişilerin haklarını ihlal eden içerikler</li>
          <li>Sisteme zarar verecek otomatik saldırılar veya kötüye kullanım</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">5. Fikri mülkiyet</h2>
        <p>
          Platform yazılımı ve arayüzü {c.legalName}&apos;a aittir. Oluşturduğunuz QR içeriklerinin
          sorumluluğu size aittir.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">6. Sorumluluk sınırı</h2>
        <p>
          Hizmet &quot;olduğu gibi&quot; sunulur. Makul özen gösterilse de kesintisiz erişim garanti
          edilmez. Dolaylı zararlardan sorumluluk kabul edilmez.
        </p>
      </section>

      <p className="text-sm">
        <Link href="/gizlilik-politikasi" className="link-brand">
          Gizlilik Politikası
        </Link>
        {" · "}
        <Link href="/mesafeli-satis-sozlesmesi" className="link-brand">
          Mesafeli Satış Sözleşmesi
        </Link>
      </p>
    </LegalLayout>
  );
}
