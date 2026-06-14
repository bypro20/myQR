"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AuthSidePanel } from "@/components/auth/auth-side-panel";
import { HoneypotField } from "@/components/security/honeypot-field";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import { isLaunchActive, LAUNCH, signupOfferLine } from "@/lib/marketing/launch-config";
import { trackSignupConversion } from "@/lib/analytics/gtag";
import { isTurnstileSiteKeyConfigured } from "@/lib/security/turnstile";

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRequired = isTurnstileSiteKeyConfigured();

  const onTurnstile = useCallback((token: string) => setTurnstileToken(token), []);
  const onTurnstileExpire = useCallback(() => setTurnstileToken(""), []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (turnstileRequired && !turnstileToken) {
      setError("Güvenlik doğrulamasını tamamlayın.");
      return;
    }
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        company: fd.get("company"),
        _hp: fd.get("_hp"),
        turnstileToken: turnstileToken || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Kayıt başarısız.");
      setTurnstileToken("");
      return;
    }
    trackSignupConversion();
    router.push("/dashboard/qr/new");
    router.refresh();
  }

  const inputClass = "input-focus w-full rounded-lg border border-[var(--line)] px-3 py-2.5 text-sm";

  return (
    <form onSubmit={submit} className="relative space-y-4">
      <HoneypotField />
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--ink)]">Ad Soyad</label>
        <input name="name" required className={inputClass} placeholder="Adınız Soyadınız" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--ink)]">Şirket / İşletme</label>
        <input name="company" required className={inputClass} placeholder="İşletme adınız" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--ink)]">E-posta</label>
        <input name="email" type="email" required className={inputClass} placeholder="ornek@sirket.com" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[var(--ink)]">Şifre (min. 8 karakter)</label>
        <input name="password" type="password" minLength={8} required className={inputClass} placeholder="••••••••" />
      </div>
      <TurnstileWidget onToken={onTurnstile} onExpire={onTurnstileExpire} />
      <button type="submit" disabled={loading} className="btn-gradient w-full py-3 text-sm disabled:opacity-60">
        {loading ? "Hesap oluşturuluyor…" : "Ücretsiz Hesap Oluştur"}
        {!loading ? <ArrowRight className="h-4 w-4" /> : null}
      </button>
      <p className="text-center text-xs leading-relaxed text-[var(--ink-muted)]">
        Kayıt olarak{" "}
        <Link href="/kullanim-kosullari" target="_blank" className="link-brand">
          Kullanım Koşulları
        </Link>{" "}
        ve{" "}
        <Link href="/gizlilik-politikasi" target="_blank" className="link-brand">
          Gizlilik Politikası
        </Link>
        &apos;nı kabul etmiş olursunuz.
      </p>
    </form>
  );
}

type SignupPageClientProps = {
  signupCredits: number;
  launchActive: boolean;
};

export function SignupPageClient({ signupCredits, launchActive }: SignupPageClientProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthSidePanel
        title={launchActive ? `${LAUNCH.label} — Pro denemesi ile başlayın` : "14 gün Pro denemesi ile başlayın"}
        subtitle={`${signupOfferLine()} — tüm QR formatları ve analitik panel, kredi kartı gerekmez.`}
        bullets={[
          "45+ QR formatı anında kullanıma hazır",
          "Dinamik QR ile baskıyı yenilemeden güncelleyin",
          "15 gün deneme sonrası süre uzatma — tekrarlayan gelir modeli",
        ]}
        footer="Matbaa, ajans ve perakende işletmeleri için profesyonel QR altyapısı."
      />

      <div className="flex flex-col justify-center bg-[var(--surface-soft)] px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-1 text-sm text-[var(--ink-muted)] hover:text-[var(--brand)] lg:hidden">
            ← Ana sayfa
          </Link>
          <span className="section-badge">{launchActive ? LAUNCH.label : "Ücretsiz Deneme"}</span>
          <h1 className="mt-4 text-2xl font-bold text-[var(--ink)]">Hesabınızı oluşturun</h1>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            {signupCredits} hoş geldin kredisi ile dakikalar içinde ilk QR kodunuzu üretin.
          </p>
          <div className="card-elevated mt-8 p-6">
            <SignupForm />
          </div>
          <p className="mt-6 text-center text-sm text-[var(--ink-muted)]">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="link-brand">
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
