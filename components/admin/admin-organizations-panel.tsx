"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

type Org = {
  id: string;
  name: string;
  slug: string;
  planTier: string;
  subscriptionStatus: string;
  credits: number;
  qrCount: number;
  createdAt: string;
  _count: { qrCodes: number; memberships: number };
};

export function AdminOrganizationsPanel({ canManage = true }: { canManage?: boolean }) {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    planTier: "PRO",
    subscriptionStatus: "ACTIVE",
    creditsDelta: 0,
    creditsDescription: "",
  });

  async function load() {
    const data = await fetch("/api/admin/overview").then((r) => r.json());
    setOrgs(data.organizations || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveOrg(id: string) {
    setMessage("");
    const res = await fetch(`/api/admin/organizations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Güncellenemedi.");
      return;
    }
    setEditId(null);
    setMessage("Organizasyon güncellendi.");
    load();
  }

  async function cancelOrg(id: string, name: string) {
    if (!confirm(`"${name}" organizasyonunu iptal etmek istediğinize emin misiniz?`)) return;
    const res = await fetch(`/api/admin/organizations/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "İptal edilemedi.");
      return;
    }
    setMessage("Organizasyon iptal edildi.");
    load();
  }

  function startEdit(org: Org) {
    setEditId(org.id);
    setEditForm({
      name: org.name,
      planTier: org.planTier,
      subscriptionStatus: org.subscriptionStatus,
      creditsDelta: 0,
      creditsDescription: "",
    });
  }

  if (loading) return <p className="text-[var(--ink-muted)]">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizasyon Yönetimi"
        description="Plan değiştirin, kredi yükleyin veya düşün, abonelik durumunu yönetin"
      />

      {message ? (
        <p className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">{message}</p>
      ) : null}

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Tüm Organizasyonlar ({orgs.length})</h2>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-violet-50/50 text-left text-[var(--ink-muted)]">
              <tr>
                <th className="px-6 py-3">Organizasyon</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Abonelik</th>
                <th className="px-6 py-3">Kredi</th>
                <th className="px-6 py-3">QR / Üye</th>
                <th className="px-6 py-3">Kayıt</th>
                <th className="px-6 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o.id} className="border-t border-violet-50">
                  {editId === o.id && canManage ? (
                    <>
                      <td className="px-6 py-3" colSpan={6}>
                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                          <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="rounded-lg border px-2 py-1.5 text-sm" placeholder="Ad" />
                          <select value={editForm.planTier} onChange={(e) => setEditForm({ ...editForm, planTier: e.target.value })} className="rounded-lg border px-2 py-1.5 text-sm">
                            <option value="FREE">Deneme</option>
                            <option value="STARTER">Starter</option>
                            <option value="PRO">Pro</option>
                            <option value="BUSINESS">Business</option>
                          </select>
                          <select value={editForm.subscriptionStatus} onChange={(e) => setEditForm({ ...editForm, subscriptionStatus: e.target.value })} className="rounded-lg border px-2 py-1.5 text-sm">
                            <option value="TRIAL">Deneme</option>
                            <option value="ACTIVE">Aktif</option>
                            <option value="CANCELLED">İptal</option>
                            <option value="EXPIRED">Süresi Dolmuş</option>
                          </select>
                          <input type="number" value={editForm.creditsDelta} onChange={(e) => setEditForm({ ...editForm, creditsDelta: Number(e.target.value) })} className="rounded-lg border px-2 py-1.5 text-sm" placeholder="Kredi ±" />
                          <input value={editForm.creditsDescription} onChange={(e) => setEditForm({ ...editForm, creditsDescription: e.target.value })} className="rounded-lg border px-2 py-1.5 text-sm" placeholder="Kredi açıklaması" />
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <Button variant="accent" className="whitespace-nowrap px-4 py-2 text-xs" onClick={() => saveOrg(o.id)}>Kaydet</Button>
                          <Button variant="secondary" className="whitespace-nowrap px-4 py-2 text-xs" onClick={() => setEditId(null)}>İptal</Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <p className="font-medium text-[var(--ink)]">{o.name}</p>
                        <p className="text-xs text-[var(--ink-muted)]">{o.slug}</p>
                      </td>
                      <td className="px-6 py-4">{o.planTier}</td>
                      <td className="px-6 py-4">{o.subscriptionStatus}</td>
                      <td className="px-6 py-4 font-bold text-amber-700">{o.credits}</td>
                      <td className="px-6 py-4">{o._count.qrCodes} / {o._count.memberships}</td>
                      <td className="px-6 py-4 text-[var(--ink-muted)]">{formatDate(o.createdAt)}</td>
                      <td className="px-6 py-4">
                        {canManage ? (
                          <div className="flex flex-wrap gap-2">
                            <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => startEdit(o)}>Düzenle</Button>
                            <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => cancelOrg(o.id, o.name)}>İptal Et</Button>
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--ink-muted)]">Salt okunur</span>
                        )}
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
