"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, QrCode, X } from "lucide-react";
import { useState } from "react";
import { LaunchBanner } from "@/components/site/launch-banner";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/#ozellikler", label: "Özellikler", match: (p: string) => p === "/" },
  { href: "/pricing", label: "Fiyatlandırma", match: (p: string) => p === "/pricing" },
  { href: "/panel-kiralama", label: "Panel Kiralama", match: (p: string) => p.startsWith("/panel-kiralama") },
];

const solutionsNav = [
  { href: "/dinamik-qr-kod", label: "Dinamik QR Kod" },
  { href: "/toplu-qr-kod", label: "Toplu QR Üretim" },
  { href: "/qr-kod-matbaa", label: "Matbaa QR" },
  { href: "/restoran-menu-qr", label: "Restoran Menü QR" },
];

const moreNav = [
  ...solutionsNav,
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <LaunchBanner />
      <div className="site-header-bar" />
      <header className="sticky top-0 z-50 border-b border-[#e9d5ff]/60 bg-white/85 backdrop-blur-2xl shadow-[0_4px_24px_-8px_rgba(124,58,237,0.12)]">
        <div className="site-container flex h-16 items-center justify-between gap-4">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="logo-box h-10 w-10">
              <QrCode className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-[var(--ink)]">my</span>
              <span className="text-gradient">QR</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {mainNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn("nav-link", link.match(pathname) && "nav-link-active")}
              >
                {link.label}
              </Link>
            ))}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className={cn(
                  "nav-link inline-flex items-center gap-1",
                  (pathname === "/hakkimizda" || pathname === "/iletisim") && "nav-link-active",
                )}
              >
                Kurumsal
                <ChevronDown className={cn("h-3.5 w-3.5 transition", moreOpen && "rotate-180")} />
              </button>
              {moreOpen ? (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} aria-hidden />
                  <div className="absolute left-0 top-full z-50 mt-2 min-w-[11rem] overflow-hidden rounded-2xl border border-[#e9d5ff] bg-white p-1.5 shadow-[0_12px_40px_-8px_rgba(124,58,237,0.25)]">
                    {moreNav.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          "block rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--ink-muted)] hover:bg-[#faf5ff] hover:text-[#9333ea]",
                          pathname === link.href && "bg-gradient-to-r from-[#faf5ff] to-[#f3e8ff] text-[#9333ea]",
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost hidden sm:inline-flex">
              Giriş
            </Link>
            <Link href="/signup" className="btn-brand hidden px-5 py-2.5 sm:inline-flex">
              Ücretsiz dene
            </Link>
            <button
              type="button"
              className="rounded-xl border border-[#e9d5ff] bg-[#faf5ff] p-2.5 text-[#9333ea] lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Menü"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-[#0c0118]/60 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-0 flex h-full w-[min(100%,18rem)] animate-slide-in-right flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e9d5ff] bg-gradient-to-r from-[#faf5ff] to-white px-5 py-4">
              <span className="font-extrabold text-gradient">Menü</span>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 hover:bg-[#f3e8ff]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-4">
              {[...mainNav, ...moreNav].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-bold hover:bg-[#faf5ff] hover:text-[#9333ea]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="space-y-2 border-t border-[#e9d5ff] p-4">
              <Link href="/login" onClick={() => setOpen(false)} className="btn-outline block w-full py-3 text-center">
                Giriş
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="btn-brand block w-full py-3 text-center">
                Ücretsiz dene
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
