import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { CheckCircle2, Palette, Printer, ScanLine } from "lucide-react";

const features = [
  { icon: ScanLine, title: "14+ QR Türü", desc: "Menü, Wi-Fi, vCard, garanti ve daha fazlası" },
  { icon: Palette, title: "Baskıya Hazır Tasarım", desc: "Renk, logo ve marka uyumlu QR çıktıları" },
  { icon: Printer, title: "PNG · SVG · PDF", desc: "Pleksi, etiket ve davetiye için hazır formatlar" },
  { icon: CheckCircle2, title: "Dinamik Yönetim", desc: "Baskıdan sonra bile hedef linki güncelleyin" },
];

export default function LoginPage() {
  return (
    <div className="gradient-hero min-h-screen lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden px-12 py-16 lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">QRBaskı Studio</p>
          <h1 className="mt-6 max-w-lg text-5xl font-bold leading-tight text-violet-950">
            Baskıya hazır QR kodlarını tek panelden yönetin
          </h1>
          <p className="mt-4 max-w-md text-lg text-slate-600">
            myQR ile üretim, tasarım, yönlendirme ve raporlama tek çatı altında.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-violet-100 bg-white/70 p-4 backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 font-semibold text-violet-950">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-slate-500">© myQR · QRBaskı için geliştirildi</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <LoginForm />
          <p className="mt-6 text-center text-sm text-slate-500 lg:hidden">
            Henüz hesabınız yok mu? <Link href="/" className="font-medium text-violet-600">myQR hakkında</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
