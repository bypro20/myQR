export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  priceTry: number;
  bonus: number;
  popular?: boolean;
  /** Kısa açıklama — kart altında gösterilebilir */
  tagline?: string;
};

/**
 * Kredi paketleri — ana gelir kaynağı.
 * Küçük paket: yüksek birim fiyat · büyük paket: cazip ama kârlı.
 */
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "pack_100",
    name: "Başlangıç",
    credits: 100,
    priceTry: 179,
    bonus: 10,
    tagline: "≈ 100 statik veya 36 dinamik QR",
  },
  {
    id: "pack_500",
    name: "Standart",
    credits: 400,
    priceTry: 549,
    bonus: 80,
    popular: true,
    tagline: "≈ 480 kredi · matbaa & KOBİ",
  },
  {
    id: "pack_1500",
    name: "Profesyonel",
    credits: 1000,
    priceTry: 1299,
    bonus: 250,
    tagline: "≈ 1.250 kredi · ajans paketi",
  },
  {
    id: "pack_5000",
    name: "Kurumsal",
    credits: 3500,
    priceTry: 3799,
    bonus: 700,
    tagline: "≈ 4.200 kredi · toplu baskı",
  },
];

export function getCreditPackage(id: string) {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}

export function creditPackageTotal(pkg: CreditPackage) {
  return pkg.credits + pkg.bonus;
}

export function pricePerCredit(pkg: CreditPackage) {
  return pkg.priceTry / creditPackageTotal(pkg);
}
