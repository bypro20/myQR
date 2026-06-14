"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Coins, CreditCard, LayoutDashboard, QrCode, Settings, Shield, ShoppingBag, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminPermissionKey } from "@/lib/admin-permissions";
import { userHasAnyPermission } from "@/lib/admin-permissions";

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  permissions: AdminPermissionKey[];
  superOnly?: boolean;
};

const links: NavLink[] = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard, exact: true, permissions: ["overview"] },
  { href: "/admin/users", label: "Kullanıcılar", icon: Users, permissions: ["users_view", "users_manage"] },
  { href: "/admin/organizations", label: "Organizasyonlar", icon: Building2, permissions: ["organizations_view", "organizations_manage"] },
  { href: "/admin/qr-codes", label: "QR Kodlar", icon: QrCode, permissions: ["qr_codes_view"] },
  { href: "/admin/sales", label: "Satış & Bakiye", icon: ShoppingBag, permissions: ["payments_view", "credits_manage", "organizations_manage"] },
  { href: "/admin/credits", label: "Kredi Yönetimi", icon: Coins, permissions: ["credits_manage", "organizations_manage"] },
  { href: "/admin/payments", label: "Ödeme Geçmişi", icon: CreditCard, permissions: ["payments_view"] },
  { href: "/admin/staff", label: "Yetkili Yönetimi", icon: Shield, permissions: [], superOnly: true },
  { href: "/admin/settings", label: "Hesap Ayarları", icon: Settings, permissions: ["settings_self"] },
];

export function AdminNav({
  permissions,
  isSuperAdmin,
}: {
  permissions: AdminPermissionKey[];
  isSuperAdmin: boolean;
}) {
  const pathname = usePathname();
  const userLike = { role: isSuperAdmin ? ("SUPER_ADMIN" as const) : ("PLATFORM_ADMIN" as const), adminPermissions: JSON.stringify(permissions) };

  const visible = links.filter((link) => {
    if (link.superOnly) return isSuperAdmin;
    return userHasAnyPermission(userLike, link.permissions);
  });

  if (visible.length === 0) return null;

  return (
    <nav className="mb-8 flex gap-1 overflow-x-auto rounded-2xl border border-[var(--line)] bg-white p-1.5 shadow-sm">
      {visible.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              active
                ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md shadow-violet-200"
                : "text-[var(--ink-muted)] hover:bg-violet-50 hover:text-violet-700",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
