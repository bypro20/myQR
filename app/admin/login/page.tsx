import Link from "next/link";
import { Shield } from "lucide-react";
import { getSession } from "@/lib/auth";
import { hasAdminPanelAccess } from "@/lib/admin-permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/auth/admin-login-form";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (user && hasAdminPanelAccess(user)) {
      redirect("/admin");
    }
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="mesh-blob left-0 top-0 h-64 w-64 bg-slate-600" />
        <div className="relative">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
            <Shield className="h-7 w-7" />
            myQR Admin
          </Link>
          <h1 className="mt-16 text-4xl font-extrabold leading-tight">Platform yönetim paneli</h1>
          <p className="mt-4 max-w-md text-lg text-white/70">
            Kullanıcılar, organizasyonlar, yetkiler ve sistem ayarları — yalnızca yetkili hesaplar.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-white/60">
            <li>• Super Admin — tam yetki</li>
            <li>• Yetkili Admin — tanımlanan izinler</li>
            <li>• Müşteri hesapları bu girişten erişemez</li>
          </ul>
        </div>
        <p className="relative text-xs text-white/40">Yetkisiz erişim denemeleri kayıt altına alınır.</p>
      </div>

      <div className="flex flex-col justify-center bg-[var(--surface-soft)] px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-1 text-sm text-[var(--ink-muted)] hover:text-slate-700 lg:hidden">
            ← Ana sayfa
          </Link>
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
