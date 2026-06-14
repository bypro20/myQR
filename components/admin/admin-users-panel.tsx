"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export function AdminUsersPanel({
  canManage = true,
  canManageCredits = false,
  isSuperAdmin = false,
}: {
  canManage?: boolean;
  canView?: boolean;
  canManageCredits?: boolean;
  isSuperAdmin?: boolean;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", newPassword: "" });

  async function load() {
    const data = await fetch("/api/admin/overview").then((r) => r.json());
    setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        company: fd.get("company"),
        planTier: fd.get("planTier"),
        credits: Number(fd.get("credits") || 100),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Oluşturulamadı.");
      return;
    }
    setShowCreate(false);
    setMessage("Kullanıcı başarıyla oluşturuldu.");
    e.currentTarget.reset();
    load();
  }

  async function updateUser(id: string) {
    setMessage("");
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        email: editForm.email,
        ...(editForm.newPassword ? { newPassword: editForm.newPassword } : {}),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Güncellenemedi.");
      return;
    }
    setEditId(null);
    setMessage("Kullanıcı güncellendi.");
    load();
  }

  async function setPartnerRole(user: User, asPartner: boolean) {
    setMessage("");
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: asPartner ? "PARTNER" : "CUSTOMER" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Rol güncellenemedi.");
      return;
    }
    setMessage(asPartner ? `${user.name} iş ortağı olarak tanımlandı.` : `${user.name} normal müşteri olarak güncellendi.`);
    load();
  }

  function roleLabel(role: string) {
    if (role === "SUPER_ADMIN") return "Super Admin";
    if (role === "PLATFORM_ADMIN") return "Yetkili";
    if (role === "PARTNER") return "İş Ortağı";
    return "Müşteri";
  }

  function roleBadgeVariant(role: string): "default" | "accent" | "muted" {
    if (role === "SUPER_ADMIN") return "default";
    if (role === "PLATFORM_ADMIN" || role === "PARTNER") return "accent";
    return "muted";
  }

  async function toggleActive(user: User) {
    setMessage("");
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "İşlem başarısız.");
      return;
    }
    load();
  }

  function startEdit(user: User) {
    setEditId(user.id);
    setEditForm({ name: user.name, email: user.email, newPassword: "" });
  }

  if (loading) return <p className="text-[var(--ink-muted)]">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kullanıcı Yönetimi"
        description="Tüm kullanıcıları görüntüleyin, düzenleyin ve yeni hesap oluşturun"
        action={canManage ? <Button variant="secondary" onClick={() => setShowCreate(!showCreate)}>{showCreate ? "İptal" : "Yeni Kullanıcı"}</Button> : undefined}
      />

      {message ? (
        <p className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">{message}</p>
      ) : null}

      {showCreate && canManage ? (
        <Card>
          <CardHeader><h2 className="font-semibold">Yeni Kullanıcı Oluştur</h2></CardHeader>
          <CardBody>
            <form onSubmit={createUser} className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Ad Soyad</span>
                <input name="name" required className="input-focus w-full rounded-lg border px-3 py-2" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">E-posta</span>
                <input name="email" type="email" required className="input-focus w-full rounded-lg border px-3 py-2" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Şirket</span>
                <input name="company" required className="input-focus w-full rounded-lg border px-3 py-2" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Şifre</span>
                <input name="password" type="password" minLength={8} required className="input-focus w-full rounded-lg border px-3 py-2" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Plan</span>
                <select name="planTier" className="input-focus w-full rounded-lg border px-3 py-2">
                  <option value="FREE">Deneme</option>
                  <option value="STARTER">Starter</option>
                  <option value="PRO">Pro</option>
                  <option value="BUSINESS">Business</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Başlangıç Kredisi</span>
                <input name="credits" type="number" defaultValue={100} min={0} className="input-focus w-full rounded-lg border px-3 py-2" />
              </label>
              <div className="flex items-end sm:col-span-2">
                <Button type="submit">Kullanıcı Oluştur</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-violet-50/50 text-left text-[var(--ink-muted)]">
              <tr>
                <th className="px-6 py-3">Kullanıcı</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3">Durum</th>
                <th className="px-6 py-3">Son Giriş</th>
                <th className="px-6 py-3">Kayıt</th>
                <th className="px-6 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-violet-50">
                  {editId === u.id && canManage ? (
                    <>
                      <td className="px-6 py-3" colSpan={5}>
                        <div className="grid gap-2 sm:grid-cols-3">
                          <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="rounded-lg border px-2 py-1.5 text-sm" placeholder="Ad" />
                          <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="rounded-lg border px-2 py-1.5 text-sm" placeholder="E-posta" />
                          <input value={editForm.newPassword} onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })} className="rounded-lg border px-2 py-1.5 text-sm" placeholder="Yeni şifre (opsiyonel)" type="password" />
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <Button variant="accent" className="whitespace-nowrap px-4 py-2 text-xs" onClick={() => updateUser(u.id)}>
                            Kaydet
                          </Button>
                          <Button variant="secondary" className="whitespace-nowrap px-4 py-2 text-xs" onClick={() => setEditId(null)}>
                            İptal
                          </Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <p className="font-medium text-[var(--ink)]">{u.name}</p>
                        <p className="text-xs text-[var(--ink-muted)]">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={roleBadgeVariant(u.role)}>
                          {roleLabel(u.role)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.isActive ? "default" : "muted"}>{u.isActive ? "Aktif" : "Pasif"}</Badge>
                      </td>
                      <td className="px-6 py-4 text-[var(--ink-muted)]">{formatDate(u.lastLoginAt)}</td>
                      <td className="px-6 py-4 text-[var(--ink-muted)]">{formatDate(u.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {canManageCredits && (u.role === "CUSTOMER" || u.role === "PARTNER") ? (
                            <Link href={`/admin/credits?user=${u.id}`}>
                              <Button variant="secondary" className="px-2 py-1 text-xs">
                                <Coins className="h-3 w-3" />
                                Kredi Ver
                              </Button>
                            </Link>
                          ) : null}
                          {isSuperAdmin && u.role === "CUSTOMER" ? (
                            <Button variant="accent" className="px-2 py-1 text-xs" onClick={() => setPartnerRole(u, true)}>
                              İş ortağı yap
                            </Button>
                          ) : null}
                          {isSuperAdmin && u.role === "PARTNER" ? (
                            <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setPartnerRole(u, false)}>
                              Müşteriye çevir
                            </Button>
                          ) : null}
                          {canManage && (u.role === "CUSTOMER" || u.role === "PARTNER") ? (
                            <>
                              <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => startEdit(u)}>Düzenle</Button>
                              <Button variant={u.isActive ? "danger" : "secondary"} className="px-2 py-1 text-xs" onClick={() => toggleActive(u)}>
                                {u.isActive ? "Pasifleştir" : "Aktifleştir"}
                              </Button>
                            </>
                          ) : null}
                          {!canManage && !canManageCredits ? (
                            <span className="text-xs text-[var(--ink-muted)]">—</span>
                          ) : null}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
