"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Coins, Infinity, Search, Sparkles, User, Zap } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCreditsDisplay, formatDate } from "@/lib/utils";

type Org = {
  id: string;
  name: string;
  slug: string;
  credits: number;
  unlimitedCredits: boolean;
  planTier: string;
  memberships: Array<{ user: { id: string; name: string; email: string; role: string } }>;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  role: string;
  memberships: Array<{
    organization: {
      id: string;
      name: string;
      slug: string;
      credits: number;
      unlimitedCredits: boolean;
      planTier: string;
    };
  }>;
};

type Tx = {
  id: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  organization: { name: string; slug: string };
};

const PRESETS = [
  { label: "+1K", amount: 1_000 },
  { label: "+10K", amount: 10_000 },
  { label: "+100K", amount: 100_000 },
  { label: "+1M", amount: 1_000_000 },
  { label: "+10M", amount: 10_000_000 },
];

export function AdminCreditsPanel() {
  const searchParams = useSearchParams();
  const [organizations, setOrganizations] = useState<Org[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [myOrg, setMyOrg] = useState<{ id: string; name: string; credits: number; unlimitedCredits: boolean } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [search, setSearch] = useState("");
  const [customAmount, setCustomAmount] = useState("10000");
  const [setAmount, setSetAmount] = useState("100000");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await fetch("/api/admin/credits").then((r) => r.json());
    if (data.error) {
      setError(data.error);
      setLoading(false);
      return;
    }
    setOrganizations(data.organizations || []);
    setCustomers(data.customers || []);
    setTransactions(data.transactions || []);
    setMyOrg(data.myOrganization || null);

    const preselectUser = searchParams.get("user");
    if (preselectUser && data.customers?.some((u: Customer) => u.id === preselectUser)) {
      setSelectedUserId(preselectUser);
      const orgId = data.customers.find((u: Customer) => u.id === preselectUser)?.memberships[0]?.organization.id;
      if (orgId) setSelectedOrgId(orgId);
    } else if (!selectedUserId && data.customers?.[0]) {
      setSelectedUserId(data.customers[0].id);
      setSelectedOrgId(data.customers[0].memberships[0]?.organization.id || "");
    } else if (!selectedOrgId && data.organizations?.[0]) {
      setSelectedOrgId(data.organizations[0].id);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.memberships[0]?.organization.name.toLowerCase().includes(q),
    );
  }, [customers, search]);

  const selectedCustomer = customers.find((u) => u.id === selectedUserId);
  const selectedOrg =
    organizations.find((o) => o.id === selectedOrgId) ||
    (selectedCustomer?.memberships[0]?.organization
      ? {
          ...selectedCustomer.memberships[0].organization,
          memberships: [{ user: { id: selectedCustomer.id, name: selectedCustomer.name, email: selectedCustomer.email, role: selectedCustomer.role } }],
        }
      : undefined);

  function selectUser(user: Customer) {
    setSelectedUserId(user.id);
    const orgId = user.memberships[0]?.organization.id;
    if (orgId) setSelectedOrgId(orgId);
  }

  async function apiCall(body: Record<string, unknown>) {
    setMessage("");
    setError("");
    const payload = {
      ...body,
      ...(selectedUserId && !body.organizationId ? { userId: selectedUserId } : {}),
      ...(body.organizationId || selectedOrgId ? { organizationId: body.organizationId || selectedOrgId } : {}),
    };
    const res = await fetch("/api/admin/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "İşlem başarısız.");
      return false;
    }
    await load();
    return true;
  }

  async function addCredits(amount: number, opts?: { userId?: string; organizationId?: string }) {
    const ok = await apiCall({
      userId: opts?.userId || selectedUserId,
      organizationId: opts?.organizationId || selectedOrgId,
      amount,
      description: `Admin panelinden +${amount.toLocaleString("tr-TR")} kredi`,
    });
    if (ok) setMessage(`${amount.toLocaleString("tr-TR")} kredi yüklendi.`);
  }

  async function setExactCredits() {
    const credits = Number(setAmount);
    if (!Number.isFinite(credits) || credits < 0) {
      setError("Geçerli bir kredi miktarı girin.");
      return;
    }
    const ok = await apiCall({
      action: "set",
      credits,
      description: `Bakiye ${credits.toLocaleString("tr-TR")} olarak ayarlandı`,
    });
    if (ok) setMessage("Kredi bakiyesi güncellendi.");
  }

  async function toggleUnlimited(unlimited: boolean, opts?: { userId?: string; organizationId?: string }) {
    const ok = await apiCall({
      action: "unlimited",
      userId: opts?.userId || selectedUserId,
      organizationId: opts?.organizationId || selectedOrgId,
      unlimited,
    });
    if (ok) setMessage(unlimited ? "Sınırsız kredi aktif edildi." : "Sınırsız kredi kapatıldı.");
  }

  if (loading) return <p className="text-[var(--ink-muted)]">Yükleniyor…</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kredi Yönetimi"
        description="İstediğiniz kullanıcıya istediğiniz kadar kredi yükleyin — limit yok"
      />

      {message ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p> : null}
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {myOrg ? (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardBody className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Hesabınız</p>
              <p className="mt-1 text-lg font-bold text-[var(--ink)]">{myOrg.name}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-amber-900">
                <Coins className="h-4 w-4" />
                Bakiye: <strong className="text-xl">{formatCreditsDisplay(myOrg.credits, myOrg.unlimitedCredits)}</strong>
                {myOrg.unlimitedCredits ? <Badge variant="accent">Sınırsız</Badge> : null}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!myOrg.unlimitedCredits ? (
                <Button variant="accent" onClick={() => toggleUnlimited(true, { organizationId: myOrg.id })}>
                  <Infinity className="h-4 w-4" />
                  Kendime Sınırsız
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => toggleUnlimited(false, { organizationId: myOrg.id })}>
                  Sınırsızı Kapat
                </Button>
              )}
              <Button variant="primary" onClick={() => addCredits(10_000_000, { organizationId: myOrg.id })}>
                <Zap className="h-4 w-4" />
                +10M
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <h2 className="flex items-center gap-2 font-semibold">
              <User className="h-5 w-5 text-violet-600" />
              Kullanıcı Seç — Kredi Yükle
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Kullanıcı adı, e-posta veya şirket ara…"
                className="input-focus w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm"
              />
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-[var(--line)] p-2">
              {filteredCustomers.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-[var(--ink-muted)]">Kullanıcı bulunamadı.</p>
              ) : (
                filteredCustomers.map((u) => {
                  const org = u.memberships[0]?.organization;
                  const active = u.id === selectedUserId;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => selectUser(u)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        active ? "bg-violet-100 ring-2 ring-violet-300" : "hover:bg-violet-50"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--ink)]">{u.name}</p>
                        <p className="truncate text-xs text-[var(--ink-muted)]">{u.email}</p>
                        {org ? <p className="truncate text-xs text-violet-600">{org.name}</p> : null}
                      </div>
                      <div className="shrink-0 text-right">
                        {org?.unlimitedCredits ? (
                          <Badge variant="accent">∞</Badge>
                        ) : (
                          <span className="text-sm font-bold text-amber-700">{org?.credits.toLocaleString("tr-TR")}</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {selectedCustomer && selectedOrg ? (
              <div className="rounded-xl bg-violet-50 px-4 py-3 text-sm">
                <p className="font-semibold text-violet-900">{selectedCustomer.name}</p>
                <p className="text-violet-700">{selectedCustomer.email}</p>
                <p className="mt-1 text-violet-800">
                  {selectedOrg.name} · Mevcut: {formatCreditsDisplay(selectedOrg.credits, selectedOrg.unlimitedCredits)} kredi
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Button key={p.amount} variant="secondary" className="text-xs" onClick={() => addCredits(p.amount)} disabled={!selectedUserId}>
                  {p.label}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="input-focus flex-1 rounded-lg border px-3 py-2 text-sm"
                placeholder="İstediğiniz miktar"
              />
              <Button onClick={() => addCredits(Number(customAmount))} disabled={!selectedUserId}>
                Kredi Yükle
              </Button>
            </div>

            <div className="grid gap-2 border-t border-[var(--line)] pt-4 sm:grid-cols-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={setAmount}
                  onChange={(e) => setSetAmount(e.target.value)}
                  className="input-focus flex-1 rounded-lg border px-3 py-2 text-sm"
                  placeholder="Bakiye"
                />
                <Button variant="secondary" onClick={setExactCredits} disabled={!selectedUserId}>
                  Ayarla
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-600"
                  disabled={!selectedUserId}
                  onClick={async () => {
                    if (!confirm("Seçili kullanıcının bakiyesini sıfırlamak istiyor musunuz?")) return;
                    const ok = await apiCall({ action: "reset_balance", credits: 0, description: "Admin: bakiye sıfırlandı" });
                    if (ok) setMessage("Bakiye sıfırlandı.");
                  }}
                >
                  Sıfırla
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="accent" className="flex-1" onClick={() => toggleUnlimited(true)} disabled={!selectedUserId}>
                  <Infinity className="h-4 w-4" />
                  Sınırsız Ver
                </Button>
                <Button variant="ghost" onClick={() => toggleUnlimited(false)} disabled={!selectedUserId}>
                  Kaldır
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-5 w-5 text-violet-600" />
              Hızlı İşlemler
            </h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {filteredCustomers.slice(0, 8).map((u) => {
              const org = u.memberships[0]?.organization;
              if (!org) return null;
              return (
                <div key={u.id} className="flex items-center justify-between gap-2 rounded-lg border border-violet-50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="truncate text-[10px] text-[var(--ink-muted)]">{formatCreditsDisplay(org.credits, org.unlimitedCredits)} kr</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" className="px-2 py-1 text-[10px]" onClick={() => addCredits(10_000, { userId: u.id, organizationId: org.id })}>
                      +10K
                    </Button>
                    <Button variant="ghost" className="px-2 py-1 text-[10px]" onClick={() => toggleUnlimited(true, { userId: u.id, organizationId: org.id })}>
                      ∞
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Son Kredi İşlemleri</h2>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-violet-50/50 text-left text-[var(--ink-muted)]">
              <tr>
                <th className="px-6 py-3">Organizasyon</th>
                <th className="px-6 py-3">İşlem</th>
                <th className="px-6 py-3">Miktar</th>
                <th className="px-6 py-3">Bakiye</th>
                <th className="px-6 py-3">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[var(--ink-muted)]">Henüz işlem yok.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-violet-50">
                    <td className="px-6 py-3 font-medium">{tx.organization.name}</td>
                    <td className="px-6 py-3 text-[var(--ink-muted)]">{tx.description}</td>
                    <td className={`px-6 py-3 font-semibold ${tx.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {tx.amount >= 0 ? "+" : ""}{tx.amount.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-6 py-3">{tx.balanceAfter.toLocaleString("tr-TR")}</td>
                    <td className="px-6 py-3 text-[var(--ink-muted)]">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
