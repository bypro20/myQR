"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { HoneypotField } from "@/components/security/honeypot-field";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import { isTurnstileSiteKeyConfigured } from "@/lib/security/turnstile";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        _hp: fd.get("_hp"),
        turnstileToken: turnstileToken || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "E-posta veya şifre hatalı.");
      setTurnstileToken("");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card-elevated relative p-8">
      <HoneypotField />
      <span className="section-badge">Müşteri Girişi</span>
      <h1 className="mt-4 text-2xl font-bold text-[var(--ink)]">Panele hoş geldiniz</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">QR kodlarınızı yönetmek için giriş yapın</p>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">E-posta</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
            <input
              className="input-focus w-full rounded-lg border border-[var(--line)] py-2.5 pl-10 pr-3 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="username"
              required
            />
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Şifre</span>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
            <input
              type="password"
              className="input-focus w-full rounded-lg border border-[var(--line)] py-2.5 pl-10 pr-3 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
        </label>
      </div>

      <TurnstileWidget onToken={onTurnstile} onExpire={onTurnstileExpire} />

      <button type="submit" disabled={loading} className="btn-gradient mt-6 w-full py-3 text-sm disabled:opacity-60">
        {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
        {!loading ? <ArrowRight className="h-4 w-4" /> : null}
      </button>
    </form>
  );
}
