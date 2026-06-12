"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { LogoLight } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@myqr.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("E-posta veya şifre hatalı.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="glass rounded-3xl p-8 shadow-2xl shadow-violet-500/10">
      <LogoLight />
      <div className="mt-8">
        <h1 className="text-2xl font-bold text-violet-950">Panele Giriş</h1>
        <p className="mt-1 text-sm text-slate-500">QRBaskı QR yönetim sistemine hoş geldiniz</p>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="mt-6 space-y-4">
        <label className="block">
          <Label>E-posta</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </label>
        <label className="block">
          <Label>Şifre</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input type="password" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </label>
      </div>

      <Button disabled={loading} className="mt-6 w-full py-3">
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        {!loading ? <ArrowRight className="h-4 w-4" /> : null}
      </Button>

      <p className="mt-6 text-center text-xs text-slate-400">
        <Link href="/" className="text-violet-600 hover:underline">Ana sayfaya dön</Link>
      </p>
    </form>
  );
}
