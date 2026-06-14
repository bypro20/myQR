"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Coins,
  Plus,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCreditsDisplay, formatDate } from "@/lib/utils";

type Customer = {
  id: string;
  name: string;
  slug: string;
  planTier: string;
  credits: number;
  qrCount: number;
  subscriptionStatus: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
  } | null;
};

type Overview = {
  partner: { id: string; name: string; credits: number; unlimitedCredits: boolean };
  stats: {
    customerCount: number;
    activeCustomers: number;
    totalCustomerCredits: number;
    totalQrCodes: number;
  };
  customers: Customer[];
};

const CREDIT_PRESETS = [100, 500, 1000, 5000];

export function PartnerCustomersPanel() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [allocateId, setAllocateId] = useState<string | null>(null);
  const [allocateAmount, setAllocateAmount] = useState("500");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", company: "", newPassword: "" });

  async function load() {
    const res = await fetch("/api/partner/customers");
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Yüklenemedi.");
      setLoading(false);
      return;
    }
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createCustomer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/partner/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        company: fd.get("company"),
        planTier: fd.get("planTier"),
        credits: Number(fd.get("credits") || 0),
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Oluşturulamadı.");
      return;
    }
    setShowCreate(false);
    setMessage(`${json.customer.name} müşteri paneli oluşturuldu. Giriş bilgilerini müşterinize iletin.`);
    e.currentTarget.reset();
    load();
  }

  async function allocateCredits(orgId: string) {
    setMessage("");
    setError("");
    const amount = Number(allocateAmount);
    if (!amount || amount <= 0) {
      setError("Geçerli kredi miktarı girin.");
      return;
    }
    const res = await fetch("/api/partner/credits/allocate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: orgId, amount }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Aktarım başarısız.");
      return;
    }
    setAllocateId(null);
    setMessage(`${json.customer.name} hesabına ${amount.toLocaleString("tr-TR")} kredi aktarıldı.`);
    load();
  }

  async function updateCustomer(id: string) {
    setMessage("");
    setError("");
    const res = await fetch(`/api/partner/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        email: editForm.email,
        company: editForm.company,
        ...(editForm.newPassword ? { newPassword: editForm.newPassword } : {}),
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Güncellenemedi.");
      return;
    }
    setEditId(null);
    setMessage("Müşteri bilgileri güncellendi.");
    load();
  }

  async function toggleActive(customer: Customer) {
    if (!customer.owner) return;
    setMessage("");
    setError("");
    const res = await fetch(`/api/partner/customers/${customer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !customer.owner.isActive }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "İşlem başarısız.");
      return;
    }
    load();
  }

  function startEdit(customer: Customer) {
    if (!customer.owner) return;
    setEditId(customer.id);
    setEditForm({
      name: customer.owner.name,
      email: customer.owner.email,
      company: customer.name,
      newPassword: "",
    });
  }

  if (loading) return <p className="text-[var(--ink-muted)]">Yükleniyor…</p>;
  if (!data) return <p className="text-rose-600">{error || "Veri yüklenemedi."}</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Müşteri Panelleri"
        description="Müşterilerinize ayrı panel açın, kredi aktarın ve hesaplarını yönetin"
        action={
          <Button variant="secondary" onClick={() => setShowCreate(!showCreate)}>
            <UserPlus className="h-4 w-4" />
            {showCreate ? "İptal" : "Yeni Müşteri Paneli"}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Kredi stoku</p>
              <p className="text-xl font-bold text-[var(--ink)]">
                {formatCreditsDisplay(data.partner.credits, data.partner.unlimitedCredits)}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Müşteri paneli</p>
              <p className="text-xl font-bold text-[var(--ink)]">{data.stats.customerCount}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              <Coins className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Dağıtılan kredi</p>
              <p className="text-xl font-bold text-[var(--ink)]">{data.stats.totalCustomerCredits.toLocaleString("tr-TR")}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Toplam QR</p>
              <p className="text-xl font-bold text-[var(--ink)]">{data.stats.totalQrCodes}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>
      ) : null}

      {showCreate ? (
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Yeni Müşteri Paneli Oluştur</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Müşteriniz kendi e-posta ve şifresiyle giriş yapar; QR kodlarını bağımsız yönetir.
            </p>
          </CardHeader>
          <CardBody>
            <form onSubmit={createCustomer} className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Müşteri adı soyadı</span>
                <input name="name" required className="input-focus w-full rounded-lg border px-3 py-2" placeholder="Ahmet Yılmaz" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">E-posta (giriş)</span>
                <input name="email" type="email" required className="input-focus w-full rounded-lg border px-3 py-2" placeholder="musteri@firma.com" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Şirket / işletme adı</span>
                <input name="company" required className="input-focus w-full rounded-lg border px-3 py-2" placeholder="Restoran A" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Başlangıç şifresi</span>
                <input name="password" type="password" minLength={8} required className="input-focus w-full rounded-lg border px-3 py-2" placeholder="Min. 8 karakter" />
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
                <span className="mb-1 block font-medium">Başlangıç kredisi (stokunuzdan)</span>
                <input name="credits" type="number" defaultValue={100} min={0} className="input-focus w-full rounded-lg border px-3 py-2" />
              </label>
              <div className="flex items-end sm:col-span-2">
                <Button type="submit">
                  <Plus className="h-4 w-4" />
                  Müşteri Paneli Oluştur
                </Button>
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
                <th className="px-6 py-3">Müşteri</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Kredi</th>
                <th className="px-6 py-3">QR</th>
                <th className="px-6 py-3">Durum</th>
                <th className="px-6 py-3">Son giriş</th>
                <th className="px-6 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {data.customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--ink-muted)]">
                    Henüz müşteri paneli yok. &quot;Yeni Müşteri Paneli&quot; ile ilk müşterinizi ekleyin.
                  </td>
                </tr>
              ) : (
                data.customers.map((c) => (
                  <tr key={c.id} className="border-t border-violet-50">
                    {editId === c.id ? (
                      <>
                        <td className="px-6 py-3" colSpan={6}>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            <input value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} className="rounded-lg border px-2 py-1.5 text-sm" placeholder="Şirket" />
                            <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="rounded-lg border px-2 py-1.5 text-sm" placeholder="Ad soyad" />
                            <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="rounded-lg border px-2 py-1.5 text-sm" placeholder="E-posta" />
                            <input value={editForm.newPassword} onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })} className="rounded-lg border px-2 py-1.5 text-sm" placeholder="Yeni şifre (opsiyonel)" type="password" />
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex gap-2">
                            <Button variant="accent" className="px-3 py-1.5 text-xs" onClick={() => updateCustomer(c.id)}>Kaydet</Button>
                            <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setEditId(null)}>İptal</Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <p className="font-medium text-[var(--ink)]">{c.name}</p>
                          {c.owner ? (
                            <p className="text-xs text-[var(--ink-muted)]">{c.owner.name} · {c.owner.email}</p>
                          ) : null}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="muted">{c.planTier}</Badge>
                        </td>
                        <td className="px-6 py-4 font-semibold text-[var(--ink)]">{c.credits.toLocaleString("tr-TR")}</td>
                        <td className="px-6 py-4 text-[var(--ink-muted)]">{c.qrCount}</td>
                        <td className="px-6 py-4">
                          <Badge variant={c.owner?.isActive ? "default" : "muted"}>
                            {c.owner?.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-[var(--ink-muted)]">{formatDate(c.owner?.lastLoginAt ?? null)}</td>
                        <td className="px-6 py-4">
                          {allocateId === c.id ? (
                            <div className="flex min-w-[220px] flex-wrap items-center gap-2">
                              <input
                                value={allocateAmount}
                                onChange={(e) => setAllocateAmount(e.target.value)}
                                type="number"
                                min={1}
                                className="w-24 rounded-lg border px-2 py-1 text-xs"
                              />
                              <div className="flex flex-wrap gap-1">
                                {CREDIT_PRESETS.map((p) => (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => setAllocateAmount(String(p))}
                                    className="rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700"
                                  >
                                    +{p}
                                  </button>
                                ))}
                              </div>
                              <Button variant="accent" className="px-2 py-1 text-xs" onClick={() => allocateCredits(c.id)}>Aktar</Button>
                              <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setAllocateId(null)}>İptal</Button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => { setAllocateId(c.id); setAllocateAmount("500"); }}>
                                <Coins className="h-3 w-3" />
                                Kredi aktar
                              </Button>
                              <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => startEdit(c)}>Düzenle</Button>
                              <Button variant={c.owner?.isActive ? "danger" : "secondary"} className="px-2 py-1 text-xs" onClick={() => toggleActive(c)}>
                                {c.owner?.isActive ? "Pasifleştir" : "Aktifleştir"}
                              </Button>
                            </div>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-5 text-sm text-[var(--ink-muted)]">
          <p className="font-semibold text-[var(--ink)]">Müşteriniz nasıl giriş yapar?</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Oluşturduğunuz e-posta ve şifreyi müşterinize iletin.</li>
            <li>Müşteri <strong>myqar.net/login</strong> adresinden giriş yapar.</li>
            <li>Kendi panelinde QR oluşturur, menü günceller ve raporları görür.</li>
            <li>Ek kredi gerektiğinde siz &quot;Kredi aktar&quot; ile stokunuzdan yükleyin.</li>
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}
