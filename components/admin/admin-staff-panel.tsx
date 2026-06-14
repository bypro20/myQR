"use client";

import { useEffect, useMemo, useState } from "react";
import { Shield, UserPlus } from "lucide-react";
import {
  ADMIN_PERMISSIONS,
  AdminPermissionKey,
  ALL_ADMIN_PERMISSIONS,
  parseAdminPermissions,
} from "@/lib/admin-permissions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type StaffUser = {
  id: string;
  name: string;
  email: string;
  adminPermissions: string;
  grantedAt: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  grantedBy: { name: string; email: string } | null;
};

type Candidate = { id: string; name: string; email: string };

const groupedPermissions = ALL_ADMIN_PERMISSIONS.reduce<Record<string, typeof ALL_ADMIN_PERMISSIONS>>((acc, key) => {
  const group = ADMIN_PERMISSIONS[key].group;
  if (!acc[group]) acc[group] = [];
  acc[group].push(key);
  return acc;
}, {});

function PermissionPicker({
  selected,
  onChange,
}: {
  selected: AdminPermissionKey[];
  onChange: (next: AdminPermissionKey[]) => void;
}) {
  function toggle(key: AdminPermissionKey) {
    onChange(selected.includes(key) ? selected.filter((p) => p !== key) : [...selected, key]);
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedPermissions).map(([group, keys]) => (
        <div key={group}>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">{group}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {keys.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--line)] p-3 transition hover:border-violet-200 hover:bg-violet-50/50"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(key)}
                  onChange={() => toggle(key)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-semibold text-[var(--ink)]">{ADMIN_PERMISSIONS[key].label}</span>
                  <span className="block text-xs text-[var(--ink-muted)]">{ADMIN_PERMISSIONS[key].description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminStaffPanel() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showGrant, setShowGrant] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [permissions, setPermissions] = useState<AdminPermissionKey[]>(["overview", "users_view"]);

  async function load() {
    const data = await fetch("/api/admin/staff").then((r) => r.json());
    setStaff(data.staff || []);
    setCandidates(data.candidates || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const availableCandidates = useMemo(
    () => candidates.filter((c) => !staff.some((s) => s.id === c.id)),
    [candidates, staff],
  );

  async function grantAccess(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");

    const body =
      mode === "existing"
        ? { userId: selectedUserId, permissions }
        : {
            name: (e.currentTarget.elements.namedItem("name") as HTMLInputElement).value,
            email: (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value,
            password: (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value,
            permissions,
          };

    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Yetki verilemedi.");
      return;
    }
    setShowGrant(false);
    setEditId(null);
    setMessage("Yetkili kullanıcı kaydedildi. Erişim ve yetkiler sizin kontrolünüzde.");
    load();
  }

  async function updateStaff(id: string, patch: { permissions?: AdminPermissionKey[]; isActive?: boolean }) {
    setMessage("");
    setError("");
    const res = await fetch(`/api/admin/staff/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Güncellenemedi.");
      return;
    }
    setEditId(null);
    setMessage("Yetkiler güncellendi.");
    load();
  }

  async function revoke(id: string, name: string) {
    if (!confirm(`"${name}" kullanıcısının admin panel erişimini kaldırmak istediğinize emin misiniz?`)) return;
    const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Yetki kaldırılamadı.");
      return;
    }
    setMessage("Admin erişimi kaldırıldı. Kullanıcı normal müşteri olarak devam eder.");
    load();
  }

  if (loading) return <p className="text-[var(--ink-muted)]">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yetkili Yönetimi"
        description="İstediğiniz kişiye admin paneli verin — hangi işlemleri yapabileceğini siz belirleyin. Tam kontrol sizde kalır."
        action={
          <Button variant="secondary" onClick={() => { setShowGrant(!showGrant); setEditId(null); }}>
            <UserPlus className="h-4 w-4" />
            {showGrant ? "İptal" : "Yetki Ver"}
          </Button>
        }
      />

      <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-blue-50">
        <CardBody className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
          <div className="text-sm text-violet-900">
            <p className="font-semibold">Nasıl çalışır?</p>
            <p className="mt-1 text-violet-800/90">
              Mevcut bir müşteriye veya yeni bir hesaba kısıtlı admin yetkisi tanımlayın. Kullanıcı yalnızca seçtiğiniz
              menüleri görür; yetkileri istediğiniz zaman güncelleyebilir veya tamamen kaldırabilirsiniz.
            </p>
          </div>
        </CardBody>
      </Card>

      {message ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p> : null}
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {showGrant ? (
        <Card>
          <CardHeader><h2 className="font-semibold">Yeni Yetkili Tanımla</h2></CardHeader>
          <CardBody>
            <form onSubmit={grantAccess} className="space-y-6">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("existing")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${mode === "existing" ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-700"}`}
                >
                  Mevcut Kullanıcı
                </button>
                <button
                  type="button"
                  onClick={() => setMode("new")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${mode === "new" ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-700"}`}
                >
                  Yeni Hesap
                </button>
              </div>

              {mode === "existing" ? (
                <label className="block max-w-md text-sm">
                  <span className="mb-1 block font-medium">Kullanıcı seçin</span>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required
                    className="input-focus w-full rounded-lg border px-3 py-2.5"
                  >
                    <option value="">Seçin…</option>
                    {availableCandidates.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium">Ad Soyad</span>
                    <input name="name" required className="input-focus w-full rounded-lg border px-3 py-2.5" />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium">E-posta</span>
                    <input name="email" type="email" required className="input-focus w-full rounded-lg border px-3 py-2.5" />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1 block font-medium">Şifre</span>
                    <input name="password" type="password" minLength={8} required className="input-focus w-full rounded-lg border px-3 py-2.5" />
                  </label>
                </div>
              )}

              <div>
                <p className="mb-3 text-sm font-semibold text-[var(--ink)]">Yapabileceği işlemler</p>
                <PermissionPicker selected={permissions} onChange={setPermissions} />
              </div>

              <Button type="submit">Yetkiyi Kaydet</Button>
            </form>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Yetkili Kullanıcılar ({staff.length})</h2>
        </CardHeader>
        <CardBody className="space-y-4 p-0">
          {staff.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-[var(--ink-muted)]">Henüz yetkili kullanıcı tanımlanmadı.</p>
          ) : (
            staff.map((s) => {
              const perms = parseAdminPermissions(s.adminPermissions);
              const editing = editId === s.id;
              return (
                <div key={s.id} className="border-t border-violet-50 px-6 py-5 first:border-t-0">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[var(--ink)]">{s.name}</p>
                        <Badge variant={s.isActive ? "default" : "muted"}>{s.isActive ? "Aktif" : "Pasif"}</Badge>
                      </div>
                      <p className="text-sm text-[var(--ink-muted)]">{s.email}</p>
                      <p className="mt-1 text-xs text-[var(--ink-muted)]">
                        Verildi: {formatDate(s.grantedAt)} · Son giriş: {formatDate(s.lastLoginAt)}
                        {s.grantedBy ? ` · Tanımlayan: ${s.grantedBy.name}` : ""}
                      </p>
                    </div>
                    {!editing ? (
                      <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => { setEditId(s.id); setPermissions(perms); setShowGrant(false); }}>
                          Yetkileri Düzenle
                        </Button>
                        <Button
                          variant={s.isActive ? "secondary" : "primary"}
                          className="px-3 py-1.5 text-xs"
                          onClick={() => updateStaff(s.id, { isActive: !s.isActive })}
                        >
                          {s.isActive ? "Pasifleştir" : "Aktifleştir"}
                        </Button>
                        <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => revoke(s.id, s.name)}>
                          Erişimi Kaldır
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  {!editing ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {perms.map((p) => (
                        <span key={p} className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">
                          {ADMIN_PERMISSIONS[p].label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <PermissionPicker selected={permissions} onChange={setPermissions} />
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Button variant="accent" className="whitespace-nowrap px-4 py-2 text-xs" onClick={() => updateStaff(s.id, { permissions })}>Kaydet</Button>
                        <Button variant="secondary" className="whitespace-nowrap px-4 py-2 text-xs" onClick={() => setEditId(null)}>İptal</Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardBody>
      </Card>
    </div>
  );
}
