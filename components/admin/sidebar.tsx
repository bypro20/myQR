"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  FileStack,
  LayoutDashboard,
  LogOut,
  PartyPopper,
  Plus,
  QrCode,
  ShieldCheck,
  Upload,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { cn, formatCreditsDisplay } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";

type NavItem = {
  href: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
};

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Genel",
    items: [
      { href: "/dashboard", label: "Panel", hint: "Özet ve son kayıtlar", icon: LayoutDashboard, accent: "from-violet-500 to-indigo-600" },
      { href: "/dashboard/qr", label: "QR Kodlar", hint: "Oluştur, düzenle, indir", icon: QrCode, accent: "from-blue-500 to-cyan-500" },
      { href: "/dashboard/stats", label: "İstatistikler", hint: "Kendi QR özetiniz", icon: BarChart3, accent: "from-emerald-500 to-teal-500" },
    ],
  },
  {
    title: "Modüller",
    items: [
      { href: "/dashboard/templates", label: "Şablonlar", hint: "Marka ve baskı ayarları", icon: FileStack, accent: "from-orange-500 to-amber-500" },
      { href: "/dashboard/warranty", label: "Garanti", hint: "Ürün kayıt formları", icon: ShieldCheck, accent: "from-sky-500 to-blue-600" },
      { href: "/dashboard/lcv", label: "LCV", hint: "Davetiye yanıtları", icon: PartyPopper, accent: "from-pink-500 to-rose-500" },
      { href: "/dashboard/bulk", label: "Toplu Üretim", hint: "CSV ile seri QR", icon: Upload, accent: "from-fuchsia-500 to-purple-600" },
    ],
  },
  {
    title: "Hesap",
    items: [
      { href: "/dashboard/billing", label: "Faturalandırma", hint: "Plan ve kredi yönetimi", icon: CreditCard, accent: "from-amber-500 to-orange-500" },
    ],
  },
];

const partnerGroup: { title: string; items: NavItem[] } = {
  title: "İş Ortağı",
  items: [
    { href: "/dashboard/customers", label: "Müşteri Panelleri", hint: "Panel aç, kredi aktar", icon: Users, accent: "from-indigo-500 to-violet-600" },
  ],
};

export function AdminSidebar({
  credits = 0,
  unlimitedCredits = false,
  isPartner = false,
  variant = "desktop",
  onNavigate,
}: {
  credits?: number;
  unlimitedCredits?: boolean;
  isPartner?: boolean;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside
      className={cn(
        "w-72 shrink-0 flex-col bg-gradient-to-b from-[#0a0d14] via-[#12182a] to-[#0f1420] text-white",
        variant === "desktop" ? "hidden lg:flex" : "flex h-full lg:hidden",
      )}
    >
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <Logo />
          {variant === "mobile" && onNavigate ? (
            <button
              type="button"
              onClick={onNavigate}
              className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Menüyü kapat"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-orange-400/20 bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-600/15 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-200/80">Kullanılabilir</p>
                <p className="text-sm font-bold text-white">
                  {formatCreditsDisplay(credits, unlimitedCredits)}{" "}
                  <span className="text-xs font-semibold text-white/70">
                    {unlimitedCredits ? "sınırsız kredi" : "kredi"}
                  </span>
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/billing"
              onClick={onNavigate}
              className="rounded-lg bg-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/25"
            >
              Yükle
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <Link
          href="/dashboard/qr/new"
          onClick={onNavigate}
          className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-violet-500/40 hover:brightness-110"
        >
          <Plus className="h-4 w-4 transition group-hover:rotate-90" />
          Yeni QR Oluştur
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {(isPartner ? [partnerGroup, ...groups] : groups).map((group) => (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">{group.title}</p>
            <div className="space-y-1">
              {group.items.map(({ href, label, hint, icon: Icon, accent }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                      active
                        ? "bg-white/12 text-white shadow-inner ring-1 ring-white/10"
                        : "text-white/65 hover:bg-white/8 hover:text-white",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md transition group-hover:scale-105",
                        accent,
                        active ? "shadow-lg" : "opacity-80 group-hover:opacity-100",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold leading-tight">{label}</span>
                      {hint ? <span className="block truncate text-[11px] text-white/45 group-hover:text-white/55">{hint}</span> : null}
                    </span>
                    {active ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" /> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/8 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
