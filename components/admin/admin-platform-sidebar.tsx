"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Building2,
  Coins,
  CreditCard,
  LayoutDashboard,
  LogOut,
  QrCode,
  Megaphone,
  Radio,
  Settings,
  Shield,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import type { AdminPermissionKey } from "@/lib/admin-permissions";
import { userHasAnyPermission } from "@/lib/admin-permissions";

type NavLink = {
  href: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  permissions: AdminPermissionKey[];
  superOnly?: boolean;
  exact?: boolean;
};

const groups: { title: string; items: NavLink[] }[] = [
  {
    title: "Platform",
    items: [
      { href: "/admin", label: "Genel Bakış", hint: "Özet istatistikler", icon: LayoutDashboard, accent: "from-violet-500 to-indigo-600", permissions: ["overview"], exact: true },
      { href: "/admin/activity", label: "Canlı Aktivite", hint: "Kim ne yaptı, anlık akış", icon: Radio, accent: "from-rose-500 to-pink-600", permissions: ["activity_view"] },
    ],
  },
  {
    title: "Kullanıcılar",
    items: [
      { href: "/admin/users", label: "Kullanıcılar", hint: "Hesap oluştur, düzenle", icon: Users, accent: "from-blue-500 to-cyan-500", permissions: ["users_view", "users_manage"] },
      { href: "/admin/organizations", label: "Organizasyonlar", hint: "Plan ve abonelik", icon: Building2, accent: "from-sky-500 to-blue-600", permissions: ["organizations_view", "organizations_manage"] },
    ],
  },
  {
    title: "QR & İçerik",
    items: [
      { href: "/admin/qr-codes", label: "QR Kodlar", hint: "Kim ne üretti, detaylar", icon: QrCode, accent: "from-emerald-500 to-teal-500", permissions: ["qr_codes_view"] },
    ],
  },
  {
    title: "Finans",
    items: [
      { href: "/admin/sales", label: "Satış & Bakiye", hint: "Onay, bildirim, yönetim", icon: ShoppingBag, accent: "from-orange-500 to-amber-500", permissions: ["payments_view", "credits_manage", "organizations_manage"] },
      { href: "/admin/ads", label: "Reklam Merkezi", hint: "Google Ads, sürekli reklam", icon: Megaphone, accent: "from-green-500 to-emerald-600", permissions: ["payments_view", "overview"] },
      { href: "/admin/credits", label: "Kredi Yönetimi", hint: "Yükle, ayarla, sıfırla", icon: Coins, accent: "from-amber-500 to-yellow-500", permissions: ["credits_manage", "organizations_manage"] },
      { href: "/admin/payments", label: "Ödeme Geçmişi", hint: "Tüm ödeme kayıtları", icon: CreditCard, accent: "from-fuchsia-500 to-purple-600", permissions: ["payments_view"] },
    ],
  },
  {
    title: "Sistem",
    items: [
      { href: "/admin/staff", label: "Yetkili Yönetimi", hint: "Admin yetkileri", icon: Shield, accent: "from-slate-500 to-slate-700", permissions: [], superOnly: true },
      { href: "/admin/settings", label: "Hesap Ayarları", hint: "Profil ve şifre", icon: Settings, accent: "from-gray-500 to-gray-600", permissions: ["settings_self"] },
    ],
  },
];

export function AdminPlatformSidebar({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [permissions, setPermissions] = useState<AdminPermissionKey[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.permissions) setPermissions(data.permissions);
        if (data.isSuperAdmin) setIsSuperAdmin(true);
        if (data.user?.name) setUserName(data.user.name);
      })
      .catch(() => {});
  }, []);

  const userLike = useMemo(
    () => ({
      role: isSuperAdmin ? ("SUPER_ADMIN" as const) : ("PLATFORM_ADMIN" as const),
      adminPermissions: JSON.stringify(permissions),
    }),
    [isSuperAdmin, permissions],
  );

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
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
            <button type="button" onClick={onNavigate} className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Menüyü kapat">
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-violet-400/20 bg-gradient-to-r from-violet-600/30 via-indigo-600/20 to-violet-700/15 p-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/40">
              <Shield className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-violet-200/90">Platform Admin</p>
              <p className="truncate text-sm font-bold text-white">{userName}</p>
              <p className="truncate text-[11px] text-white/60">{isSuperAdmin ? "Süper Admin" : "Yetkili Admin"}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => {
          const visible = group.items.filter((link) => {
            if (link.superOnly) return isSuperAdmin;
            if (link.permissions.length === 0) return false;
            return userHasAnyPermission(userLike, link.permissions);
          });
          if (visible.length === 0) return null;
          return (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">{group.title}</p>
              <div className="space-y-1">
                {visible.map(({ href, label, hint, icon: Icon, accent, exact }) => {
                  const active = isActive(href, exact);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                        active ? "bg-white/12 text-white shadow-inner ring-1 ring-white/10" : "text-white/65 hover:bg-white/8 hover:text-white",
                      )}
                    >
                      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-md", accent, active ? "shadow-lg" : "opacity-80 group-hover:opacity-100")}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-tight">{label}</span>
                        <span className="block truncate text-[11px] text-white/45 group-hover:text-white/55">{hint}</span>
                      </span>
                      {href === "/admin/activity" ? (
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                        </span>
                      ) : active ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4 space-y-2">
        <Link href="/dashboard" onClick={onNavigate} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white">
          <Activity className="h-4 w-4" />
          Müşteri Paneline Dön
        </Link>
        <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white">
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
