"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  FileStack,
  LayoutDashboard,
  LogOut,
  PartyPopper,
  Plus,
  QrCode,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";

const links = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/dashboard/qr", label: "QR Kodlar", icon: QrCode },
  { href: "/dashboard/templates", label: "Şablonlar", icon: FileStack },
  { href: "/dashboard/warranty", label: "Garanti", icon: ShieldCheck },
  { href: "/dashboard/lcv", label: "LCV", icon: PartyPopper },
  { href: "/dashboard/bulk", label: "Toplu Üretim", icon: Upload },
  { href: "/dashboard/stats", label: "İstatistikler", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden w-72 shrink-0 flex-col bg-gradient-to-b from-[#1e1b4b] to-[#312e81] text-white lg:flex">
      <div className="border-b border-white/10 px-6 py-6">
        <Logo />
      </div>

      <div className="px-4 pt-5">
        <Link
          href="/dashboard/qr/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Yeni QR Oluştur
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-white/15 text-white shadow-inner"
                  : "text-violet-100 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-violet-100 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
