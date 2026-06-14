"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, Shield, User } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
};

export function AdminSettingsPanel() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [emailForm, setEmailForm] = useState({ currentPassword: "", newEmail: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setName(data.user?.name || "");
      });
  }, []);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    const res = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "name", name }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Güncellenemedi.");
      return;
    }
    setUser(data.user);
    setMessage("Adınız güncellendi.");
  }

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    const res = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "email", ...emailForm }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "E-posta güncellenemedi.");
      return;
    }
    setUser(data.user);
    setEmailForm({ currentPassword: "", newEmail: "" });
    setMessage("E-posta adresiniz güncellendi. Oturum yenilendi.");
    router.refresh();
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm) {
      setError("Yeni şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    setMessage("");
    setError("");
    const res = await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "password",
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Şifre güncellenemedi.");
      return;
    }
    setPasswordForm({ currentPassword: "", newPassword: "", confirm: "" });
    setMessage("Şifreniz başarıyla değiştirildi.");
  }

  if (!user) return <p className="text-[var(--ink-muted)]">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Hesap Ayarları"
        description="E-posta, şifre ve profil bilgilerinizi yönetin"
      />

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-semibold text-[var(--ink)]">Hesap Bilgileri</h2>
              <p className="text-xs text-[var(--ink-muted)]">
                Rol: {user.role === "SUPER_ADMIN" ? "Super Admin (Tam Yetki)" : user.role === "PLATFORM_ADMIN" ? "Yetkili Admin (Kısıtlı)" : user.role} · Kayıt: {formatDate(user.createdAt)} · Son giriş: {formatDate(user.lastLoginAt)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={saveName} className="max-w-md space-y-4">
            <label className="block text-sm">
              <span className="mb-1 flex items-center gap-1.5 font-medium">
                <User className="h-4 w-4 text-violet-600" />
                Görünen Ad
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-focus w-full rounded-lg border px-3 py-2.5"
              />
            </label>
            <p className="text-sm text-[var(--ink-muted)]">Mevcut e-posta: <strong>{user.email}</strong></p>
            <Button type="submit" disabled={loading} variant="secondary">Adı Güncelle</Button>
          </form>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-semibold">
              <Mail className="h-5 w-5 text-violet-600" />
              E-posta Değiştir
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={saveEmail} className="space-y-4">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Yeni E-posta</span>
                <input
                  type="email"
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                  required
                  className="input-focus w-full rounded-lg border px-3 py-2.5"
                  placeholder="yeni@email.com"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Mevcut Şifre (doğrulama)</span>
                <input
                  type="password"
                  value={emailForm.currentPassword}
                  onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                  required
                  className="input-focus w-full rounded-lg border px-3 py-2.5"
                />
              </label>
              <Button type="submit" disabled={loading}>E-postayı Güncelle</Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-semibold">
              <KeyRound className="h-5 w-5 text-violet-600" />
              Şifre Değiştir
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={savePassword} className="space-y-4">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Mevcut Şifre</span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  className="input-focus w-full rounded-lg border px-3 py-2.5"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Yeni Şifre</span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  minLength={8}
                  required
                  className="input-focus w-full rounded-lg border px-3 py-2.5"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Yeni Şifre (Tekrar)</span>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  minLength={8}
                  required
                  className="input-focus w-full rounded-lg border px-3 py-2.5"
                />
              </label>
              <Button type="submit" disabled={loading}>Şifreyi Güncelle</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
