"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import { useState } from "react";
import { LogoLight } from "@/components/brand/logo";
import { AdminSidebar } from "@/components/admin/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const titles: Record<string, string> = {
    "/dashboard": "Panel",
    "/dashboard/qr": "QR Kodlar",
    "/dashboard/qr/new": "Yeni QR",
    "/dashboard/templates": "Şablonlar",
    "/dashboard/warranty": "Garanti",
    "/dashboard/lcv": "LCV",
    "/dashboard/bulk": "Toplu Üretim",
    "/dashboard/stats": "İstatistikler",
  };

  const title =
    Object.entries(titles).find(([k]) => pathname === k || pathname.startsWith(`${k}/`))?.[1] || "myQR";

  return (
    <div className="flex min-h-screen bg-[#f4f2ff]">
      <AdminSidebar />
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 h-full w-72">
            <AdminSidebar />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-violet-100 bg-white/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg border border-violet-200 p-2 lg:hidden"
                onClick={() => setOpen(true)}
              >
                <Menu className="h-5 w-5 text-violet-700" />
              </button>
              <div className="lg:hidden"><LogoLight /></div>
              <p className="hidden text-sm font-semibold text-violet-900 lg:block">{title}</p>
            </div>
            <Link
              href="/dashboard/qr/new"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 lg:hidden"
            >
              <Plus className="h-4 w-4" />
              Yeni
            </Link>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
