import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/site/legal-layout";
import { getCompanyInfo } from "@/lib/company-info";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Teslimat ve İade Şartları",
  description: "myQR dijital hizmet teslimat, iptal ve iade koşulları.",
  path: "/teslimat-iade",
});

export default function DeliveryRefundPage() {
  const c = getCompanyInfo();

  return (
    <LegalLayout
      title="Teslimat ve İade Şartları"
      description="Dijital hizmetlerimizin teslimat, iptal ve iade süreçlerine ilişkin bilgiler."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">1. Teslimat</h2>
        <p>
          {c.tradeName} üzerinden satın alınan abonelik planları ve kredi paketleri dijital hizmet
          niteliğindedir. Ödeme onaylandıktan sonra krediler veya plan hakları kullanıcı paneline{" "}
          <strong>anında</strong> tanımlanır.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Kart ödemesi: 3D Secure onayı sonrası otomatik yükleme</li>
          <li>FAST/havale: Transfer doğrulandıktan sonra en geç 1 iş günü içinde yükleme</li>
        </ul>
        <p>Fiziksel ürün gönderimi yapılmamaktadır.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">2. Hizmetin ifası</h2>
        <p>
          Dijital hizmet, ödeme tamamlandığı anda ifa edilmeye başlar. Kullanılan krediler veya
          abonelik süresi boyunca hizmet kesintisiz sunulmaya çalışılır; planlı bakım durumları
          önceden duyurulur.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">3. İptal</h2>
        <p>
          Abonelik planları dönem sonunda otomatik yenilenmez; iptal talebi {c.email} üzerinden
          iletilebilir. Mevcut dönem sonuna kadar hizmet devam eder.
        </p>
        <p>
          Ödeme işlemi başlatıldıktan sonra banka tarafından onaylanmış kart işlemleri için iptal,
          banka ve ödeme kuruluşu kurallarına tabidir.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">4. İade (cayma hakkı)</h2>
        <p>
          6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, elektronik ortamda anında
          ifa edilen dijital içeriklere ilişkin hizmetlerde, tüketicinin açık onayı ile ifaya
          başlandığında cayma hakkı bulunmamaktadır.
        </p>
        <p>
          Kullanılmamış kredi paketleri için teknik hata veya mükerrer ödeme gibi istisnai durumlarda{" "}
          {c.email} adresine başvurarak inceleme talep edebilirsiniz. Haklı bulunan taleplerde iade
          veya kredi düzeltmesi yapılır.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">5. Şikâyet ve destek</h2>
        <p>
          Teslimat veya iade ile ilgili taleplerinizi {c.email} adresine iletebilirsiniz. Tüketici
          uyuşmazlıklarında ilgili Tüketici Hakem Heyeti ve Tüketici Mahkemelerine başvuru hakkınız
          saklıdır.
        </p>
      </section>

      <p className="text-sm">
        <Link href="/mesafeli-satis-sozlesmesi" className="link-brand">
          Mesafeli Satış Sözleşmesi
        </Link>
        {" · "}
        <Link href="/gizlilik-politikasi" className="link-brand">
          Gizlilik Politikası
        </Link>
      </p>
    </LegalLayout>
  );
}
