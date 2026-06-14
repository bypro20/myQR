"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, ExternalLink, QrCode, Search, User } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { QR_TYPE_LABELS } from "@/lib/qr/types";

type Owner = { id: string; name: string; email: string } | null;

type QrItem = {
  id: string;
  name: string;
  type: string;
  mode: string;
  shortCode: string | null;
  targetUrl: string | null;
  customerName: string | null;
  projectName: string | null;
  productType: string | null;
  description: string | null;
  isActive: boolean;
  scanCount: number;
  lastScannedAt: string | null;
  createdAt: string;
  action: string;
  operationDetail: string;
  typeLabel: string;
  creditSpent: number | null;
  creditDescription: string | null;
  owner: Owner;
  organization: { id: string; name: string; slug: string; planTier: string };
};

type OrgOption = { id: string; name: string; slug: string; _count: { qrCodes: number } };
type UserOption = { id: string; name: string; email: string };

export function AdminQrCodesPanel() {
  const [items, setItems] = useState<QrItem[]>([]);
  const [organizations, setOrganizations] = useState<OrgOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [mode, setMode] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [userId, setUserId] = useState("");

  const load = useCallback(async (nextPage = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(nextPage) });
    if (q.trim()) params.set("q", q.trim());
    if (type) params.set("type", type);
    if (mode) params.set("mode", mode);
    if (organizationId) params.set("organizationId", organizationId);
    if (userId) params.set("userId", userId);

    const res = await fetch(`/api/admin/qr-codes?${params}`);
    const data = await res.json();
    if (res.ok) {
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      setOrganizations(data.organizations || []);
      setUsers(data.users || []);
    }
    setLoading(false);
  }, [q, type, mode, organizationId, userId, page]);

  useEffect(() => {
    void load(1);
  }, []);

  function submitFilters(e: React.FormEvent) {
    e.preventDefault();
    void load(1);
  }

  function shortLink(shortCode: string | null) {
    if (!shortCode) return null;
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/q/${shortCode}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kullanıcı QR Kodları"
        description="Kim hangi QR’ı oluşturdu, ne tür işlem yaptı ve içerik özeti"
      />

      <Card>
        <CardBody>
          <form onSubmit={submitFilters} className="grid gap-3 lg:grid-cols-7">
            <div className="relative lg:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="İsim, e-posta, QR adı, IBAN, URL..."
                className="pl-9"
              />
            </div>
            <Select value={userId} onChange={(e) => setUserId(e.target.value)}>
              <option value="">Tüm kullanıcılar</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </Select>
            <Select value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
              <option value="">Tüm organizasyonlar</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o._count.qrCodes})
                </option>
              ))}
            </Select>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Tüm tipler</option>
              {Object.entries(QR_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
            <Select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="">Tüm modlar</option>
              <option value="DYNAMIC">Dinamik</option>
              <option value="STATIC">Statik</option>
            </Select>
            <Button type="submit" variant="secondary">Filtrele</Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-violet-600" />
            <h2 className="font-semibold text-[var(--ink)]">Oluşturulan QR Kodlar</h2>
          </div>
          <span className="text-xs text-[var(--ink-muted)]">{total.toLocaleString("tr-TR")} kayıt</span>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          {loading ? (
            <p className="px-6 py-10 text-center text-[var(--ink-muted)]">Yükleniyor…</p>
          ) : items.length === 0 ? (
            <p className="px-6 py-10 text-center text-[var(--ink-muted)]">QR kodu bulunamadı.</p>
          ) : (
            <table className="min-w-[1100px] w-full text-sm">
              <thead className="bg-violet-50/50 text-left text-[var(--ink-muted)]">
                <tr>
                  <th className="px-4 py-3">Kullanıcı</th>
                  <th className="px-4 py-3">Yapılan İşlem</th>
                  <th className="px-4 py-3">İçerik / Detay</th>
                  <th className="px-4 py-3">QR Adı</th>
                  <th className="px-4 py-3">Önizleme</th>
                  <th className="px-4 py-3">Tarama</th>
                  <th className="px-4 py-3">Oluşturma</th>
                  <th className="sticky right-0 z-10 bg-violet-50/95 px-4 py-3 text-right shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)]">
                    İndir
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((qr) => {
                  const link = shortLink(qr.shortCode);
                  return (
                    <tr key={qr.id} className="border-t border-violet-50 align-top">
                      <td className="px-4 py-3">
                        {qr.owner ? (
                          <div className="min-w-[140px]">
                            <div className="flex items-start gap-2">
                              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                                <User className="h-3.5 w-3.5" />
                              </span>
                              <div>
                                <p className="font-semibold text-[var(--ink)]">{qr.owner.name}</p>
                                <p className="text-xs text-[var(--ink-muted)]">{qr.owner.email}</p>
                                <p className="mt-1 text-[11px] text-[var(--ink-muted)]">{qr.organization.name}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[var(--ink-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-violet-800">{qr.action}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant={qr.mode === "DYNAMIC" ? "default" : "muted"}>
                            {qr.mode === "DYNAMIC" ? "Dinamik" : "Statik"}
                          </Badge>
                          <Badge variant={qr.isActive ? "success" : "danger"}>
                            {qr.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                        {qr.creditSpent !== null ? (
                          <p className="mt-1 text-[11px] text-amber-700">
                            {qr.creditDescription || "Kredi harcandı"} · {qr.creditSpent} kredi
                          </p>
                        ) : null}
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        <p className="text-[var(--ink)]">{qr.operationDetail}</p>
                        {link ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-violet-600 hover:underline"
                          >
                            /q/{qr.shortCode}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[var(--ink)]">{qr.name}</p>
                        <p className="text-xs text-[var(--ink-muted)]">{qr.typeLabel}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-violet-100 bg-white p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/admin/qr-codes/${qr.id}/export?format=png&inline=1`}
                            alt={qr.name}
                            className="h-full w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{qr.scanCount.toLocaleString("tr-TR")}</p>
                        {qr.lastScannedAt ? (
                          <p className="text-[11px] text-[var(--ink-muted)]">Son: {formatDate(qr.lastScannedAt)}</p>
                        ) : (
                          <p className="text-[11px] text-[var(--ink-muted)]">Henüz taranmadı</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--ink-muted)]">{formatDate(qr.createdAt)}</td>
                      <td className="sticky right-0 z-10 bg-white px-4 py-3 text-right shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.06)]">
                        <a
                          href={`/api/admin/qr-codes/${qr.id}/export?format=png`}
                          className="inline-flex items-center gap-1 rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800 transition hover:bg-violet-100"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PNG
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <Button type="button" variant="secondary" disabled={page <= 1 || loading} onClick={() => void load(page - 1)}>
            Önceki
          </Button>
          <span className="text-sm text-[var(--ink-muted)]">
            Sayfa {page} / {totalPages}
          </span>
          <Button type="button" variant="secondary" disabled={page >= totalPages || loading} onClick={() => void load(page + 1)}>
            Sonraki
          </Button>
        </div>
      ) : null}

      <p className="text-center text-xs text-[var(--ink-muted)]">
        Kullanıcı hesabına gitmek için{" "}
        <Link href="/admin/users" className="font-semibold text-violet-600 hover:underline">
          Kullanıcı Yönetimi
        </Link>
        sayfasını kullanın.
      </p>
    </div>
  );
}
