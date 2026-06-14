"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { AdminPlatformSidebar } from "@/components/admin/admin-platform-sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminNotificationBell } from "@/components/admin/admin-notification-provider";
import { formatCreditsDisplay } from "@/lib/utils";

const dashboardTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Panel", subtitle: "İşletmenizin QR performansına tek bakışta ulaşın" },
  "/dashboard/qr": { title: "QR Kodlar", subtitle: "Tüm kodlarınızı yönetin, düzenleyin ve indirin" },
  "/dashboard/billing": { title: "Faturalandırma", subtitle: "Kredi paketleri ve abonelik planları" },
  "/dashboard/templates": { title: "Şablonlar", subtitle: "Markanıza uygun baskı şablonları" },
  "/dashboard/warranty": { title: "Garanti", subtitle: "Ürün kayıt formları ve müşteri takibi" },
  "/dashboard/lcv": { title: "LCV", subtitle: "Davetiye yanıtlarını kolayca toplayın" },
  "/dashboard/bulk": { title: "Toplu Üretim", subtitle: "CSV ile yüzlerce QR kodu tek seferde" },
  "/dashboard/stats": { title: "İstatistikler", subtitle: "Kendi QR kodlarınıza ait özet tarama verileri" },
  "/dashboard/customers": { title: "Müşteri Panelleri", subtitle: "Müşterilerinize panel açın ve kredi yönetin" },
};

const adminTitles: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Platform Admin", subtitle: "Genel bakış ve platform istatistikleri" },
  "/admin/activity": { title: "Canlı Aktivite", subtitle: "Kim ne yaptı — QR, giriş, ödeme ve admin işlemleri" },
  "/admin/users": { title: "Kullanıcı Yönetimi", subtitle: "Kullanıcıları oluşturun, düzenleyin ve yönetin" },
  "/admin/organizations": { title: "Organizasyon Yönetimi", subtitle: "Plan, kredi ve abonelik yönetimi" },
  "/admin/qr-codes": { title: "Kullanıcı QR Kodları", subtitle: "Kim ne oluşturdu, hangi işlem ve içerik özeti" },
  "/admin/sales": { title: "Ödeme Yönetimi", subtitle: "FAST onayları, abonelik ve kredi ödemeleri" },
  "/admin/credits": { title: "Kredi Yönetimi", subtitle: "Sınırsız kredi ve toplu yükleme" },
  "/admin/payments": { title: "Ödeme Geçmişi", subtitle: "Tüm platform ödemeleri" },
  "/admin/settings": { title: "Admin Ayarları", subtitle: "E-posta, şifre ve profil yönetimi" },
  "/admin/staff": { title: "Yetkili Yönetimi", subtitle: "Kısıtlı admin erişimi ve yetki tanımlama" },
};

export function DashboardShell({
  children,
  credits = 0,
  unlimitedCredits = false,
  isPartner = false,
  showAdminNotifications = false,
  variant = "dashboard",
}: {
  children: React.ReactNode;
  credits?: number;
  unlimitedCredits?: boolean;
  isPartner?: boolean;
  showAdminNotifications?: boolean;
  variant?: "dashboard" | "admin";
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const titles = variant === "admin" ? adminTitles : dashboardTitles;

  const meta =
    Object.entries(titles)
      .sort(([a], [b]) => b.length - a.length)
      .find(([k]) => pathname === k || pathname.startsWith(`${k}/`))?.[1] || {
      title: "myQR",
      subtitle: "Profesyonel QR yönetim paneli",
    };

  return (
    <div className="flex min-h-screen bg-[var(--surface-soft)]">
      {variant === "admin" ? (
        <AdminPlatformSidebar variant="desktop" />
      ) : (
        <AdminSidebar credits={credits} unlimitedCredits={unlimitedCredits} isPartner={isPartner} variant="desktop" />
      )}

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <div className="relative z-10 h-full w-72 animate-slide-in-left shadow-2xl">
            {variant === "admin" ? (
              <AdminPlatformSidebar variant="mobile" onNavigate={() => setOpen(false)} />
            ) : (
              <AdminSidebar
                credits={credits}
                unlimitedCredits={unlimitedCredits}
                isPartner={isPartner}
                variant="mobile"
                onNavigate={() => setOpen(false)}
              />
            )}
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-white/85 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded-xl border border-[var(--line)] bg-white p-2.5 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="Menüyü aç"
              >
                <Menu className="h-5 w-5 text-[var(--ink)]" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--ink-muted)]">
                  <span>Panel</span>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <span className="truncate text-violet-600">{meta.title}</span>
                </div>
                <h1 className="truncate text-base font-bold text-[var(--ink)] sm:text-lg">{meta.title}</h1>
                <p className="hidden truncate text-xs text-[var(--ink-muted)] sm:block">{meta.subtitle}</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {showAdminNotifications ? <AdminNotificationBell /> : null}
              {variant === "admin" ? null : (
                <div className="hidden items-center gap-2 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 sm:flex">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-bold text-amber-900">{formatCreditsDisplay(credits, unlimitedCredits)}</span>
                  <span className="text-xs text-amber-700/80">{unlimitedCredits ? "sınırsız" : "kredi"}</span>
                </div>
              )}
              {variant === "admin" ? null : (
              <Link
                href="/dashboard/qr/new"
                className="btn-gradient px-3 py-2 text-sm sm:px-4 sm:py-2.5"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Yeni QR</span>
                <span className="sm:hidden">Yeni</span>
              </Link>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
