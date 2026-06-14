"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Lock, Mail, Shield } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Giriş başarısız.");
      return;
    }
    router.push(data.redirectTo || "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card-elevated border-slate-200 p-8 shadow-xl">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
        <Shield className="h-3.5 w-3.5" />
        Yönetici Girişi
      </span>
      <h1 className="mt-4 text-2xl font-bold text-[var(--ink)]">Platform yönetimi</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">Super Admin ve yetkili kullanıcılar için ayrı giriş</p>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Yönetici e-posta</span>
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

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-800 to-slate-950 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Giriş yapılıyor…" : "Yönetici Girişi"}
        {!loading ? <ArrowRight className="h-4 w-4" /> : null}
      </button>

      <p className="mt-6 text-center text-sm text-[var(--ink-muted)]">
        Müşteri misiniz?{" "}
        <Link href="/login" className="font-semibold text-violet-600 hover:underline">
          Müşteri girişi
        </Link>
      </p>
    </form>
  );
}
