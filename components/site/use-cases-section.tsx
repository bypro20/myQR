import { Building2, Printer, ShoppingBag, UtensilsCrossed } from "lucide-react";

const cases = [
  {
    icon: Printer,
    sector: "Matbaa & baskı",
    headline: "Baskıyı bir kez, geliri sürekli",
    points: ["Toplu CSV → ZIP indirme", "Kalıcı QR lisansı matbaa müşterileri için", "Müşteri başına ayrı panel (bayi)"],
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: UtensilsCrossed,
    sector: "Restoran & kafe",
    headline: "Menü QR — anında güncelleme",
    points: ["Dinamik menü linki", "Aylık/yıllık süre paketleri", "Tarama analitiği ile yoğun saatler"],
    gradient: "from-orange-500 to-rose-500",
  },
  {
    icon: ShoppingBag,
    sector: "Perakende & e-ticaret",
    headline: "Kampanya QR'ları",
    points: ["Haftalık kampanya paketleri", "WhatsApp & IBAN QR", "Garanti formu modülü"],
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Building2,
    sector: "Ajans & kurumsal",
    headline: "White-label teslimat",
    points: ["45+ format tek panelde", "Pro analitik & toplu üretim", "API (Business plan)"],
    gradient: "from-emerald-500 to-teal-600",
  },
];

export function UseCasesSection() {
  return (
    <section className="section-pad section-slate">
      <div className="site-container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-badge">Kimler için?</span>
          <h2 className="section-title mt-4 text-[var(--ink)]">
            Sektörünüze göre{" "}
            <span className="text-gradient">hazır çözüm</span>
          </h2>
          <p className="section-sub mx-auto">
            Matbaadan ajansa, restorandan e-ticarete — QR ihtiyacı olan her işletme myQR ile gelir üretebilir.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {cases.map(({ icon: Icon, sector, headline, points, gradient }) => (
            <article key={sector} className="card-glow card-hover overflow-hidden p-6">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">{sector}</p>
                  <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">{headline}</h3>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-[var(--ink-muted)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
