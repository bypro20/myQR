import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/site/legal-layout";
import { formatCompanyAddress, getCompanyInfo } from "@/lib/company-info";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Gizlilik Politikası",
  description: "myQR kişisel verilerin korunması ve gizlilik politikası (KVKK uyumlu).",
  path: "/gizlilik-politikasi",
});

export default function PrivacyPage() {
  const c = getCompanyInfo();
  const address = formatCompanyAddress(c);

  return (
    <LegalLayout
      title="Gizlilik Politikası"
      description="6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında hazırlanmıştır."
    >
      <p>
        <strong>{c.legalName}</strong> ({c.tradeName}) olarak kişisel verilerinizin güvenliği bizim için
        önemlidir. Bu politika, {c.website} üzerinden sunulan hizmetler kapsamında toplanan verilerin
        işlenmesine ilişkin esasları açıklar.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">1. Veri sorumlusu</h2>
        <p>
          Unvan: {c.legalName}
          <br />
          Adres: {address}
          <br />
          E-posta: {c.email}
          {c.kep ? (
            <>
              <br />
              KEP: {c.kep}
            </>
          ) : null}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">2. Toplanan veriler</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Kimlik ve iletişim bilgileri (ad, e-posta, telefon, kuruluş adı)</li>
          <li>Hesap ve oturum bilgileri</li>
          <li>Ödeme işlem bilgileri (kart bilgileri tarafımızca saklanmaz; ödeme kuruluşu tarafından işlenir)</li>
          <li>QR kod içerikleri ve kullanım istatistikleri</li>
          <li>IP adresi, tarayıcı ve cihaz bilgileri (güvenlik ve analitik amaçlı)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">3. İşleme amaçları</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Hizmet sözleşmesinin kurulması ve ifası</li>
          <li>Fatura ve ödeme işlemlerinin yürütülmesi</li>
          <li>Müşteri destek hizmetlerinin sağlanması</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          <li>Bilgi güvenliği ve dolandırıcılık önleme</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">4. Verilerin aktarımı</h2>
        <p>
          Ödeme işlemleri için iyzico veya banka sanal POS sağlayıcılarına; barındırma için bulut
          altyapı sağlayıcılarına yalnızca hizmetin gerektirdiği ölçüde aktarım yapılabilir. Aktarımlar
          KVKK ve ilgili mevzuata uygun şekilde gerçekleştirilir.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">5. Saklama süresi</h2>
        <p>
          Kişisel veriler, işleme amacının gerektirdiği süre boyunca ve yasal saklama yükümlülükleri
          çerçevesinde muhafaza edilir; süre sonunda silinir, yok edilir veya anonim hale getirilir.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">6. Haklarınız</h2>
        <p>
          KVKK md. 11 kapsamında verilerinize erişim, düzeltme, silme, işlemeye itiraz ve şikâyet
          haklarına sahipsiniz. Taleplerinizi {c.email} adresine iletebilirsiniz.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--ink)]">7. Çerezler</h2>
        <p>
          Oturum yönetimi ve güvenlik için zorunlu çerezler kullanılmaktadır. Tarayıcı ayarlarınızdan
          çerezleri yönetebilirsiniz; bazı çerezlerin devre dışı bırakılması hizmetin çalışmasını
          etkileyebilir.
        </p>
      </section>

      <p className="text-sm">
        İlgili:{" "}
        <Link href="/kullanim-kosullari" className="link-brand">
          Kullanım Koşulları
        </Link>
        {" · "}
        <Link href="/mesafeli-satis-sozlesmesi" className="link-brand">
          Mesafeli Satış Sözleşmesi
        </Link>
      </p>
    </LegalLayout>
  );
}
