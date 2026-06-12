"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Save, ShieldAlert } from "lucide-react";
import { DEFAULT_DESIGN, QR_TYPE_LABELS, type QrDesign } from "@/lib/qr/types";
import { QrPreview } from "@/components/qr/qr-preview";
import { QrTypeFields } from "@/components/qr/type-fields";
import { LinkBioFields } from "@/components/qr/link-bio-fields";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Props = {
  initial?: Record<string, unknown>;
  qrId?: string;
  shortCode?: string | null;
};

function parsePayload(raw: unknown) {
  if (!raw) return {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw as Record<string, unknown>;
}

export function QrForm({ initial, qrId, shortCode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [warnings, setWarnings] = useState<Array<{ level: string; message: string }>>([]);
  const [payloadObj, setPayloadObj] = useState<Record<string, unknown>>(() => parsePayload(initial?.payload) || { url: "" });
  const [form, setForm] = useState({
    name: String(initial?.name || ""),
    type: String(initial?.type || "URL"),
    mode: String(initial?.mode || "DYNAMIC"),
    targetUrl: String(initial?.targetUrl || ""),
    description: String(initial?.description || ""),
    customerName: String(initial?.customerName || ""),
    projectName: String(initial?.projectName || ""),
    productType: String(initial?.productType || ""),
    isActive: initial?.isActive !== false,
    design: { ...DEFAULT_DESIGN, ...parsePayload(initial?.design) } as QrDesign,
  });

  useEffect(() => {
    if (!initial) return;
    setPayloadObj(parsePayload(initial.payload) || { url: "" });
    setForm({
      name: String(initial.name || ""),
      type: String(initial.type || "URL"),
      mode: String(initial.mode || "DYNAMIC"),
      targetUrl: String(initial.targetUrl || ""),
      description: String(initial.description || ""),
      customerName: String(initial.customerName || ""),
      projectName: String(initial.projectName || ""),
      productType: String(initial.productType || ""),
      isActive: initial.isActive !== false,
      design: { ...DEFAULT_DESIGN, ...parsePayload(initial.design) },
    });
  }, [initial]);

  const previewPayload = useMemo(() => {
    const p = { ...payloadObj };
    if (["URL", "GOOGLE_MAPS", "GOOGLE_REVIEW", "PDF", "SOCIAL"].includes(form.type) && form.targetUrl) {
      p.url = form.targetUrl;
    }
    return p;
  }, [payloadObj, form.targetUrl, form.type]);

  function setDesign(key: keyof QrDesign, value: string | number) {
    setForm((f) => ({ ...f, design: { ...f.design, [key]: value } }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = { ...previewPayload };
    if (form.type === "URL" && form.targetUrl) payload.url = form.targetUrl;

    const body = {
      name: form.name,
      type: form.type,
      mode: form.mode,
      targetUrl: form.targetUrl || undefined,
      payload,
      design: form.design,
      description: form.description,
      customerName: form.customerName,
      projectName: form.projectName,
      productType: form.productType,
      isActive: form.isActive,
      linkBio:
        form.type === "LINK_BIO"
          ? {
              title: form.name,
              description: String(payloadObj.description || ""),
              bgColor: String(payloadObj.bgColor || "#ffffff"),
              buttonColor: String(payloadObj.buttonColor || "#7c3aed"),
              links: payloadObj.links || [],
            }
          : undefined,
      lcv: form.type === "LCV" ? { eventName: form.name, eventDate: String(payloadObj.eventDate || "") } : undefined,
    };

    const res = await fetch(qrId ? `/api/qr/${qrId}` : "/api/qr", {
      method: qrId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json();
    router.push(`/dashboard/qr/${data.id || qrId}`);
    router.refresh();
  }

  async function validate() {
    if (!qrId) return;
    const res = await fetch(`/api/qr/${qrId}`, { method: "POST" });
    const data = await res.json();
    setWarnings(data.warnings || []);
  }

  const showTargetUrl = !["WIFI", "VCARD", "PHONE", "SMS", "EMAIL", "WARRANTY", "LCV", "LINK_BIO"].includes(form.type);

  return (
    <form onSubmit={save} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-violet-950">{qrId ? "QR Düzenle" : "Yeni QR Oluştur"}</h2>
              {qrId ? <Badge variant={form.isActive ? "success" : "danger"}>{form.isActive ? "Aktif" : "Pasif"}</Badge> : null}
              {shortCode ? <Badge variant="muted">/{shortCode}</Badge> : null}
            </div>
          </CardHeader>
          <CardBody className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <Label>QR Adı</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Örn: Restoran Menü QR" />
            </label>
            <label>
              <Label>QR Tipi</Label>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(QR_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </label>
            <label>
              <Label>Statik / Dinamik</Label>
              <Select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                <option value="DYNAMIC">Dinamik — link sonradan değişir</option>
                <option value="STATIC">Statik — baskıdan sonra sabit</option>
              </Select>
            </label>

            {form.type === "LINK_BIO" ? (
              <div className="md:col-span-2"><LinkBioFields payload={payloadObj} onChange={setPayloadObj} /></div>
            ) : (
              <QrTypeFields type={form.type} payload={payloadObj} onChange={setPayloadObj} />
            )}

            {showTargetUrl ? (
              <label className="md:col-span-2">
                <Label>{form.mode === "DYNAMIC" ? "Hedef Bağlantı (yönlendirme)" : "Hedef Bağlantı"}</Label>
                <Input value={form.targetUrl} onChange={(e) => setForm({ ...form, targetUrl: e.target.value })} placeholder="https://" />
              </label>
            ) : null}

            <label>
              <Label>Müşteri Adı</Label>
              <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </label>
            <label>
              <Label>Proje / Ürün Tipi</Label>
              <Input value={form.projectName} onChange={(e) => setForm({ ...form, projectName: e.target.value })} placeholder="Proje adı" />
            </label>
            <label className="md:col-span-2">
              <Label>Ürün Tipi / Açıklama</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label className="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-violet-300" />
              <span className="text-sm font-medium text-slate-700">QR aktif (taramaya açık)</span>
            </label>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold text-violet-950">Baskı Tasarımı</h3></CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <label><Label>QR Rengi</Label><input type="color" value={form.design.foregroundColor} onChange={(e) => setDesign("foregroundColor", e.target.value)} className="h-11 w-full cursor-pointer rounded-xl border border-violet-200" /></label>
            <label><Label>Arka Plan</Label><input type="color" value={form.design.backgroundColor} onChange={(e) => setDesign("backgroundColor", e.target.value)} className="h-11 w-full cursor-pointer rounded-xl border border-violet-200" /></label>
            <label><Label>Boyut (px)</Label><Input type="number" value={form.design.size} onChange={(e) => setDesign("size", Number(e.target.value))} /></label>
            <label><Label>Kenar Boşluğu</Label><Input type="number" value={form.design.margin} onChange={(e) => setDesign("margin", Number(e.target.value))} /></label>
            <label><Label>Hata Düzeltme</Label>
              <Select value={form.design.errorCorrectionLevel} onChange={(e) => setDesign("errorCorrectionLevel", e.target.value)}>
                {["L", "M", "Q", "H"].map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </label>
            <label><Label>Üst Başlık (baskı)</Label><Input value={form.design.title || ""} onChange={(e) => setDesign("title", e.target.value)} /></label>
            <label className="sm:col-span-2"><Label>Alt Metin (baskı)</Label><Input value={form.design.caption || ""} onChange={(e) => setDesign("caption", e.target.value)} /></label>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <QrPreview type={form.type} mode={form.mode} targetUrl={form.targetUrl} payload={previewPayload} design={form.design} />

        {warnings.length ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardBody className="space-y-2 text-sm">
              <div className="flex items-center gap-2 font-semibold text-amber-900"><ShieldAlert className="h-4 w-4" /> Kontrol Uyarıları</div>
              {warnings.map((w) => <p key={w.message} className={w.level === "error" ? "text-red-700" : "text-amber-800"}>{w.message}</p>)}
            </CardBody>
          </Card>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button disabled={loading} className="w-full py-3"><Save className="h-4 w-4" />{loading ? "Kaydediliyor..." : "Kaydet"}</Button>
          {qrId ? (
            <>
              <Button type="button" variant="secondary" onClick={validate}>Okunabilirlik Kontrolü</Button>
              <a href={`/api/qr/${qrId}/export?format=png`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white py-2.5 text-sm font-semibold text-violet-800 hover:bg-violet-50"><Download className="h-4 w-4" /> PNG İndir</a>
              <a href={`/api/qr/${qrId}/export?format=svg`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white py-2.5 text-sm font-semibold text-violet-800 hover:bg-violet-50"><Download className="h-4 w-4" /> SVG İndir</a>
              <a href={`/api/qr/${qrId}/export?format=pdf`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white py-2.5 text-sm font-semibold text-violet-800 hover:bg-violet-50"><Download className="h-4 w-4" /> PDF İndir</a>
            </>
          ) : null}
        </div>
      </div>
    </form>
  );
}
