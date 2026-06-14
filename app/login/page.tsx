import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { AuthSidePanel } from "@/components/auth/auth-side-panel";
import { PRICING } from "@/lib/billing/pricing-config";
import { totalSignupCredits } from "@/lib/marketing/launch-config";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Giriş",
  description: "myQR hesabınıza giriş yapın — QR kodlarınızı yönetin, analitik ve faturalandırma paneline erişin.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  const signupCredits = totalSignupCredits();

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthSidePanel
        title="QR kodlarınızı tek panelden yönetin"
        subtitle="Dinamik yönlendirme, toplu üretim ve canlı analitik — işletmeniz için hazır."
        stats={[
          { v: "45+", l: "QR formatı" },
          { v: `${PRICING.trialDays} gün`, l: "Pro denemesi" },
          { v: String(signupCredits), l: "Hoş geldin kredisi" },
        ]}
      />

      <div className="flex flex-col justify-center bg-[var(--surface-soft)] px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-1 text-sm text-[var(--ink-muted)] hover:text-[var(--brand)] lg:hidden">
            ← Ana sayfa
          </Link>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-[var(--ink-muted)]">
            Hesabınız yok mu?{" "}
            <Link href="/signup" className="link-brand inline-flex items-center gap-1">
              Ücretsiz kayıt olun <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
