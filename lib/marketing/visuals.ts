/** Kamuya açık pazarlama görselleri — /public/marketing */
export const MARKETING_IMAGES = {
  heroDashboard: "/marketing/hero-dashboard.png",
  printHouse: "/marketing/print-house.png",
  enterpriseSecurity: "/marketing/enterprise-security.png",
  qrRevenue: "/marketing/qr-revenue.png",
  whiteLabelPartner: "/marketing/white-label-partner.png",
  restaurantMenu: "/marketing/restaurant-menu.png",
  campaignWarehouse: "/marketing/campaign-warehouse.png",
} as const;

export type MarketingImageKey = keyof typeof MARKETING_IMAGES;

export const PAGE_VISUALS: Record<
  string,
  { image: string; alt: string; caption?: string }
> = {
  "/": {
    image: MARKETING_IMAGES.heroDashboard,
    alt: "myQR profesyonel QR kod yönetim paneli ve canlı analitik",
    caption: "Canlı analitik, dinamik QR ve bayi paneli — tek ekranda",
  },
  "/restoran-menu-qr": {
    image: MARKETING_IMAGES.restaurantMenu,
    alt: "Restoran menü QR kodu — dijital menü ve anında güncelleme",
    caption: "Masada QR ile dijital menü — baskıyı yenilemeden güncelleyin",
  },
  "/qr-kod-matbaa": {
    image: MARKETING_IMAGES.printHouse,
    alt: "Matbaa QR kod üretim hattı ve abonelik kiti",
    caption: "Bir kez basın, sürekli gelir — matbaa için QR abonelik modeli",
  },
  "/panel-kiralama": {
    image: MARKETING_IMAGES.whiteLabelPartner,
    alt: "White-label QR iş ortağı programı ve panel kiralama",
    caption: "Kendi QR işinizi başlatın — müşteri başına ayrı panel",
  },
  "/dinamik-qr-kod": {
    image: MARKETING_IMAGES.campaignWarehouse,
    alt: "Kampanya QR, WhatsApp ve ödeme QR yönetimi",
    caption: "Kampanya, WhatsApp ve ödeme QR — tek platformda",
  },
  "/toplu-qr-kod": {
    image: MARKETING_IMAGES.printHouse,
    alt: "Toplu QR üretim ve matbaa entegrasyonu",
    caption: "CSV → toplu üretim → ZIP — matbaa sürecine hazır",
  },
  "/hakkimizda": {
    image: MARKETING_IMAGES.enterpriseSecurity,
    alt: "Kurumsal güvenlik ve profesyonel QR altyapısı",
    caption: "Tenant izolasyonu, JWT ve BCrypt ile kurumsal güvenlik",
  },
};
