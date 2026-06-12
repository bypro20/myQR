import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Layers,
  Palette,
  QrCode,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Tüm QR Türleri",
    desc: "URL, Wi-Fi, WhatsApp, vCard, garanti, LCV ve 14+ format.",
  },
  {
    icon: Palette,
    title: "Marka Uyumlu Tasarım",
    desc: "Renk, logo, başlık ve baskı önizlemesi ile profesyonel çıktı.",
  },
  {
    icon: Layers,
    title: "25 Hazır Şablon",
    desc: "Menü standı, davetiye, etiket ve yorum kartı şablonları.",
  },
  {
    icon: Upload,
    title: "Toplu Üretim",
    desc: "CSV yükleyin, yüzlerce QR kodu ZIP olarak indirin.",
  },
  {
    icon: ShieldCheck,
    title: "Garanti & LCV",
    desc: "Aktivasyon formları ve katılım kayıtları tek panelde.",
  },
  {
    icon: BarChart3,
    title: "Tarama Analitiği",
    desc: "Dinamik QR performansını cihaz ve zaman bazlı izleyin.",
  },
];

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="gradient-hero min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-lg">
            <QrCode className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold text-violet-950">myQR</p>
            <p className="text-xs text-slate-500">QRBaskı Studio</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50">
            Giriş
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:bg-violet-700"
          >
            Panele Git <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-16">
        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-violet-700">
              <Sparkles className="h-4 w-4 text-orange-500" />
              QRBaskı için profesyonel QR platformu
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-violet-950 sm:text-5xl lg:text-6xl">
              QR kod üretimi artık <span className="text-violet-600">dört dörtlük</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Statik ve dinamik QR kodları oluşturun, baskıya hazır PNG/SVG/PDF indirin, garanti ve davetiye formlarını yönetin.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600"
              >
                Hemen Başla <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-6 py-3.5 text-sm font-semibold text-violet-800 hover:bg-violet-50"
              >
                Demo Giriş
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="animate-float absolute -left-4 top-8 rounded-2xl border border-violet-100 bg-white p-4 shadow-xl">
              <p className="text-xs font-medium text-slate-500">Dinamik QR</p>
              <p className="mt-1 font-mono text-sm text-violet-700">myqr.com/q/x8k2m9</p>
            </div>
            <div className="rounded-[2rem] border border-violet-100 bg-white p-8 shadow-2xl shadow-violet-500/15">
              <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-50 to-orange-50">
                <div className="grid grid-cols-5 gap-1.5 p-4">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-7 w-7 rounded-sm ${[0, 1, 2, 4, 5, 6, 10, 12, 14, 18, 20, 22, 24].includes(i) ? "bg-violet-800" : "bg-transparent"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-6 text-center text-sm font-semibold text-violet-950">Restoran Menü QR · Baskıya Hazır</p>
            </div>
            <div className="absolute -bottom-2 -right-2 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 shadow-lg">
              <p className="text-xs font-medium text-orange-700">+128 tarama bugün</p>
            </div>
          </div>
        </section>

        <section className="mt-24">
          <h2 className="text-center text-3xl font-bold text-violet-950">Her ihtiyaca uygun modüller</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-500">
            Basit bir QR üreticiden fazlası — QRBaskı ürünleriniz için uçtan uca yönetim.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-hover rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-violet-950">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-violet-100 bg-white/60 py-8 text-center text-sm text-slate-500">
        myQR · QRBaskı QR Üretim ve Yönetim Sistemi
      </footer>
    </div>
  );
}
