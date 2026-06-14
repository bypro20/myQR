"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, QrCode, ShieldAlert } from "lucide-react";
import type { QrDurationTier } from "@/app/generated/prisma/client";
import { DEFAULT_DESIGN, FRAME_STYLE_LABELS, catalogTypesByCategory, getDefaultPayload, isStaticOnlyType, type QrDesign } from "@/lib/qr/types";
import { QrPreview } from "@/components/qr/qr-preview";
import { QrSuccessModal, type QrSuccessData } from "@/components/qr/qr-success-modal";
import { QrDurationSelector } from "@/components/qr/qr-duration-selector";
import { QrTypeFields } from "@/components/qr/type-fields";
import { LinkBioFields } from "@/components/qr/link-bio-fields";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { triggerDirectDownload, triggerBlobDownload } from "@/lib/download-client";
import { buildQrContent } from "@/lib/qr/generators";
import { normalizeQrData } from "@/lib/qr/normalize";
import { validateQrInput } from "@/lib/qr/validate-input";
import { syncIbanPayload } from "@/lib/qr/turkish-banks";
import { validateQrDesign } from "@/lib/qr/design-validate";
import {
  availableDurationTiers,
  defaultDurationTier,
  expiryStatus,
  qrRenewalCost,
  type DurationTierDef,
} from "@/lib/qr/duration";

type Props = {
  initial?: Record<string, unknown>;
  qrId?: string;
  shortCode?: string | null;
  appUrl?: string;
  credits?: number;
  unlimitedCredits?: boolean;
  effectivePlan?: string;
  subscriptionStatus?: string;
  trialEndsAt?: string | null;
  durationTiers?: DurationTierDef[];
};

function parsePayload(raw: unknown) {
  if (!raw) return {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw as Record<string, unknown>;
}

export function QrForm({
  initial,
  qrId,
  shortCode,
  appUrl,
  credits = 0,
  unlimitedCredits = false,
  effectivePlan = "FREE",
  subscriptionStatus = "TRIAL",
  trialEndsAt = null,
  durationTiers,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);
  const [durationTier, setDurationTier] = useState<QrDurationTier>(
    () => (initial?.durationTier as QrDurationTier) || defaultDurationTier({ planTier: effectivePlan, subscriptionStatus, trialEndsAt }),
  );

  const orgPricing = useMemo(
    () => ({ planTier: effectivePlan, subscriptionStatus, trialEndsAt, credits, unlimitedCredits }),
    [effectivePlan, subscriptionStatus, trialEndsAt, credits, unlimitedCredits],
  );
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<Array<{ level: string; message: string }>>([]);
  const [successData, setSuccessData] = useState<QrSuccessData | null>(null);
  const [localQrId, setLocalQrId] = useState(qrId);
  const [localShortCode, setLocalShortCode] = useState(shortCode);

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
    setLocalQrId(qrId);
    setLocalShortCode(shortCode);
  }, [qrId, shortCode]);

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

  const effectiveMode = isStaticOnlyType(form.type) ? "STATIC" : (form.mode as "STATIC" | "DYNAMIC");

  const tiers = useMemo(
    () => durationTiers ?? availableDurationTiers(orgPricing, effectiveMode),
    [durationTiers, orgPricing, effectiveMode],
  );

  const expiry = useMemo(() => {
    if (!initial?.expiresAt && !initial?.durationTier) return null;
    return expiryStatus(
      initial?.expiresAt ? new Date(String(initial.expiresAt)) : null,
      String(initial?.durationTier || durationTier),
    );
  }, [initial, durationTier]);

  useEffect(() => {
    if (form.type !== "IBAN") return;
    const iban = String(payloadObj.iban || "").replace(/\s/g, "").toUpperCase();
    if (!iban.startsWith("TR") || iban.length !== 26) return;
    const synced = syncIbanPayload(payloadObj);
    if (synced.bankCode !== payloadObj.bankCode || synced.paymentScene !== payloadObj.paymentScene) {
      setPayloadObj(synced);
    }
  }, [form.type, payloadObj]);

  const normalized = useMemo(
    () => normalizeQrData(form.type, payloadObj, form.targetUrl, appUrl),
    [form.type, payloadObj, form.targetUrl, appUrl],
  );

  const validation = useMemo(
    () =>
      validateQrInput({
        name: form.name,
        type: form.type,
        mode: effectiveMode,
        shortCode: localShortCode || (effectiveMode === "DYNAMIC" ? "onizleme" : null),
        targetUrl: normalized.targetUrl,
        payload: normalized.payload,
        baseUrl: appUrl,
      }),
    [form.name, form.type, effectiveMode, localShortCode, normalized, appUrl],
  );

  const encodedPreview = useMemo(() => {
    if (!validation.valid) return "";
    return buildQrContent({
      type: form.type,
      mode: effectiveMode,
      shortCode: localShortCode || (effectiveMode === "DYNAMIC" ? "onizleme" : null),
      targetUrl: normalized.targetUrl,
      payload: normalized.payload,
      baseUrl: appUrl,
    });
    }, [validation.valid, form.type, effectiveMode, localShortCode, normalized, appUrl]);

  function setDesign(key: keyof QrDesign, value: string | number | boolean) {
    setForm((f) => ({ ...f, design: { ...f.design, [key]: value } }));
  }

  function showErrors(errors: string[]) {
    setFieldErrors(errors);
    setError(errors.length === 1 ? errors[0] : "QR üretilemedi. Lütfen hataları düzeltin.");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors([]);

    if (!validation.valid) {
      showErrors(validation.errors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    const body = {
      name: form.name,
      type: form.type,
      mode: effectiveMode,
      targetUrl: normalized.targetUrl,
      payload: normalized.payload,
      design: form.design,
      description: form.description,
      customerName: form.customerName,
      projectName: form.projectName,
      productType: form.productType,
      isActive: form.isActive,
      durationTier: localQrId ? undefined : durationTier,
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

    const res = await fetch(localQrId ? `/api/qr/${localQrId}` : "/api/qr", {
      method: localQrId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const errors = Array.isArray(data.errors) ? data.errors : [data.error || "Kayıt başarısız."];
      showErrors(errors);
      return;
    }

    const data = await res.json();
    const isNew = !localQrId;
    setLocalQrId(data.id);
    setLocalShortCode(data.shortCode);
    setSuccessData({
      id: data.id,
      name: data.name,
      type: data.type,
      mode: data.mode,
      shortCode: data.shortCode,
      targetUrl: data.targetUrl,
    });

    if (!isNew) {
      router.refresh();
    } else {
      window.history.replaceState(null, "", `/dashboard/qr/${data.id}`);
    }
  }

  async function renewDuration(tier: QrDurationTier) {
    if (!localQrId) return;
    setRenewLoading(true);
    setError("");
    const res = await fetch(`/api/qr/${localQrId}/renew`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durationTier: tier }),
    });
    setRenewLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Süre uzatma başarısız.");
      return;
    }
    router.refresh();
    window.location.reload();
  }

  function download(format: "png" | "svg" | "pdf") {
    setError("");
    setFieldErrors([]);

    if (!validation.valid) {
      showErrors(validation.errors);
      return;
    }

    const safeName = (form.name || "qr").replace(/\s+/g, "-");
    const activeId = localQrId;

    if (activeId) {
      setDownloading(format);
      triggerDirectDownload(`/api/qr/${activeId}/export?format=${format}`, `${safeName}.${format}`);
      setTimeout(() => setDownloading(null), 800);
      return;
    }

    if (format !== "png") {
      setError("SVG ve PDF için önce geçerli bir QR kaydedin.");
      return;
    }

    setDownloading(format);
    void fetch("/api/qr/preview", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        type: form.type,
        mode: effectiveMode,
        shortCode: "preview",
        targetUrl: normalized.targetUrl,
        payload: normalized.payload,
        design: form.design,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const errors = Array.isArray(data.errors) ? data.errors : [data.error || "İndirme başarısız."];
          showErrors(errors);
          return;
        }
        triggerBlobDownload(await res.blob(), `${safeName}.png`);
      })
      .catch(() => setError("İndirme başarısız."))
      .finally(() => setDownloading(null));
  }

  async function validateDesign() {
    if (!validation.valid || !encodedPreview) {
      showErrors(validation.errors.length ? validation.errors : ["Önce geçerli bir QR oluşturun."]);
      return;
    }

    const localWarnings = validateQrDesign(form.design, encodedPreview.length);
    if (localQrId) {
      const res = await fetch(`/api/qr/${localQrId}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      const serverWarnings = Array.isArray(data.warnings) ? data.warnings : [];
      setWarnings([...localWarnings, ...serverWarnings]);
      return;
    }
    setWarnings(localWarnings.length ? localWarnings : [{ level: "warning", message: "Tasarım banka okuması için uygun görünüyor." }]);
  }

  const displayErrors = fieldErrors.length ? fieldErrors : validation.valid ? [] : validation.errors;

  return (
    <>
      {successData && appUrl ? (
        <QrSuccessModal
          data={successData}
          appUrl={appUrl}
          isNew={!qrId}
          onClose={() => setSuccessData(null)}
        />
      ) : null}

      <form id="qr-create-form" onSubmit={save} className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-violet-950">{localQrId ? "QR Düzenle" : "Yeni QR Oluştur"}</h2>
                {localQrId ? <Badge variant={form.isActive ? "success" : "danger"}>{form.isActive ? "Aktif" : "Pasif"}</Badge> : null}
                {expiry ? <Badge variant={expiry.variant}>{expiry.label}</Badge> : null}
                {localShortCode ? <Badge variant="muted">/{localShortCode}</Badge> : null}
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              {!localQrId ? (
                <QrDurationSelector
                  tiers={tiers}
                  selected={durationTier}
                  onSelect={setDurationTier}
                  mode={effectiveMode}
                  org={orgPricing}
                />
              ) : expiry?.state === "expired" || expiry?.state === "critical" ? (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <p className="text-sm font-semibold text-orange-900">
                    {expiry.state === "expired" ? "QR süresi doldu — taramalar engellendi." : "Süre bitmek üzere."}
                  </p>
                  <p className="mt-1 text-xs text-orange-800">Süreyi uzatmak için paket seçin veya kredi yükleyin.</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {tiers.filter((t) => t.id !== "FREE_TRIAL").slice(0, 4).map((t) => {
                      const cost = qrRenewalCost(effectiveMode, t.id, orgPricing);
                      const included = cost === 0;
                      return (
                      <button
                        key={t.id}
                        type="button"
                        disabled={renewLoading || (!orgPricing.unlimitedCredits && orgPricing.credits < cost)}
                        onClick={() => renewDuration(t.id)}
                        className="rounded-lg border border-orange-300 bg-white px-3 py-2 text-left text-xs font-semibold text-orange-900 hover:bg-orange-100 disabled:opacity-50"
                      >
                        {t.label} · {included ? "dahil" : `${cost} kr`}
                      </button>
                    );})}
                  </div>
                </div>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <Label>QR Adı</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Örn: Restoran Menü QR" />
              </label>
              <label>
                <Label>QR Tipi</Label>
                <Select
                  value={form.type}
                  onChange={(e) => {
                    const nextType = e.target.value;
                    setForm({
                      ...form,
                      type: nextType,
                      mode: isStaticOnlyType(nextType) ? "STATIC" : form.mode,
                    });
                    setPayloadObj(getDefaultPayload(nextType));
                  }}
                >
                  {catalogTypesByCategory().map(({ category, types }) => (
                    <optgroup key={category} label={category}>
                      {types.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
              </label>
              <label>
                <Label>Statik / Dinamik</Label>
                <Select
                  value={form.mode}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })}
                  disabled={isStaticOnlyType(form.type)}
                >
                  <option value="DYNAMIC">Dinamik — link sonradan değişir</option>
                  <option value="STATIC">Statik — baskıya sabit (banka QR, Wi-Fi vb.)</option>
                </Select>
                {isStaticOnlyType(form.type) ? (
                  <p className="mt-1.5 text-xs text-amber-700">
                    Bu tip yalnızca statik modda çalışır — QR içine doğrudan ödeme/Wi-Fi/kartvizit verisi yazılır.
                  </p>
                ) : null}
              </label>

              {form.type === "LINK_BIO" ? (
                <div className="md:col-span-2"><LinkBioFields payload={payloadObj} onChange={setPayloadObj} /></div>
              ) : (
                <QrTypeFields type={form.type} payload={payloadObj} onChange={setPayloadObj} />
              )}

              {validation.valid ? (
                <p className="md:col-span-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                  {effectiveMode === "DYNAMIC" ? (
                    <>
                      ✓ QR üretilebilir · Tarama hedefi:{" "}
                      <span className="font-mono break-all">{normalized.targetUrl}</span>
                    </>
                  ) : (
                    <>✓ QR içeriği hazır · Statik karekod (banka/Wi-Fi/kartvizit)</>
                  )}
                </p>
              ) : (
                <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-semibold text-red-800">QR üretilemiyor:</p>
                  <ul className="mt-2 space-y-1 text-xs text-red-700">
                    {validation.errors.map((msg) => (
                      <li key={msg}>• {msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              {form.type === "IBAN" ? (
                <div className="md:col-span-2 rounded-xl border border-violet-200 bg-violet-50/60 p-4 text-sm text-violet-950">
                  <p className="font-semibold">Banka QR kodu nasıl kullanılır?</p>
                  <p className="mt-2 leading-relaxed text-violet-900/90">
                    IBAN / FAST QR kodları normal bir web linki değildir; telefon kamerası ile açılmaz.
                    Ödemeyi gönderen kişi, kendi banka uygulamasının içindeki karekod okuyucuyu kullanmalıdır.
                  </p>
                  <p className="mt-3 leading-relaxed text-violet-900/90">
                    <strong>Enpara ile test:</strong> Uygulamayı açın →{" "}
                    <strong>Para Gönder → Karekod ile Öde</strong> → bu sayfada ürettiğiniz QR’ı okutun.
                    IBAN ve tutar otomatik dolar. Yukarıda <strong>Kişiden kişiye</strong> formatının seçili
                    olduğundan emin olun (varsayılan).
                  </p>
                  <p className="mt-3 leading-relaxed text-violet-900/90">
                    <strong>Siyah-beyaz önerisi:</strong> Banka uygulamaları renkli veya koyu arka planlı QR’ları
                    çoğu zaman okuyamaz. Ödeme / havale QR’larınızı{" "}
                    <strong>siyah-beyaz oluşturun</strong> ve baskıda da siyah-beyaz kullanın — Baskı Tasarımı
                    bölümünde QR rengini siyah (<code className="rounded bg-white/80 px-1 text-xs">#111827</code>),
                    arka planı beyaz (<code className="rounded bg-white/80 px-1 text-xs">#ffffff</code>) yapmanız yeterli.
                    Menü veya tanıtım QR’larında renk kullanabilirsiniz; banka QR’larında siyah-beyaz en güvenilir yöntemdir.
                  </p>
                </div>
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
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader><h3 className="font-semibold text-violet-950">Baskı Tasarımı</h3></CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.design.frameEnabled !== false}
                  onChange={(e) => setDesign("frameEnabled", e.target.checked)}
                  className="rounded border-violet-300"
                />
                <span className="text-sm font-medium text-slate-700">Profesyonel çerçeve (baskıya hazır)</span>
              </label>
              <label><Label>Çerçeve stili</Label>
                <Select
                  value={form.design.frameStyle || "classic"}
                  onChange={(e) => setDesign("frameStyle", e.target.value)}
                >
                  {Object.entries(FRAME_STYLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </label>
              <label><Label>Çerçeve rengi</Label><input type="color" value={form.design.frameColor || form.design.foregroundColor} onChange={(e) => setDesign("frameColor", e.target.value)} className="h-11 w-full cursor-pointer rounded-xl border border-violet-200" /></label>
              <label><Label>QR Rengi</Label><input type="color" value={form.design.foregroundColor} onChange={(e) => setDesign("foregroundColor", e.target.value)} className="h-11 w-full cursor-pointer rounded-xl border border-violet-200" /></label>
              <label><Label>Arka Plan</Label><input type="color" value={form.design.backgroundColor} onChange={(e) => setDesign("backgroundColor", e.target.value)} className="h-11 w-full cursor-pointer rounded-xl border border-violet-200" /></label>
              <label><Label>Boyut (px)</Label><Input type="number" value={form.design.size} onChange={(e) => setDesign("size", Number(e.target.value))} /></label>
              <label><Label>Kenar Boşluğu</Label><Input type="number" value={form.design.margin} onChange={(e) => setDesign("margin", Number(e.target.value))} /></label>
              <label><Label>Hata Düzeltme</Label>
                <Select value={form.design.errorCorrectionLevel} onChange={(e) => setDesign("errorCorrectionLevel", e.target.value)}>
                  {["L", "M", "Q", "H"].map((v) => <option key={v} value={v}>{v}</option>)}
                </Select>
              </label>
              <label><Label>Üst Başlık (baskı)</Label><Input value={form.design.title || ""} onChange={(e) => setDesign("title", e.target.value)} placeholder="Örn: Menümüzü tarayın" /></label>
              <label className="sm:col-span-2"><Label>Alt Metin (baskı)</Label><Input value={form.design.caption || ""} onChange={(e) => setDesign("caption", e.target.value)} placeholder="Örn: Wi-Fi şifresi otomatik açılır" /></label>
              <label className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.design.qrBorderEnabled !== false}
                  onChange={(e) => setDesign("qrBorderEnabled", e.target.checked)}
                  className="rounded border-violet-300"
                />
                <span className="text-sm font-medium text-slate-700">QR etrafında ince profesyonel çerçeve</span>
              </label>
              <label className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.design.showScanLabel !== false}
                  onChange={(e) => setDesign("showScanLabel", e.target.checked)}
                  className="rounded border-violet-300"
                />
                <span className="text-sm font-medium text-slate-700">&quot;TARAYIN&quot; etiketi göster</span>
              </label>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <QrPreview
            encodedContent={encodedPreview}
            design={form.design}
            validationErrors={displayErrors}
            canPreview={validation.valid}
          />

          {warnings.length ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardBody className="space-y-2 text-sm">
                <div className="flex items-center gap-2 font-semibold text-amber-900"><ShieldAlert className="h-4 w-4" /> Kontrol Uyarıları</div>
                {warnings.map((w) => <p key={w.message} className={w.level === "error" ? "text-red-700" : "text-amber-800"}>{w.message}</p>)}
              </CardBody>
            </Card>
          ) : null}

          <div className="flex flex-col gap-2">
            {error && !displayErrors.length ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}
            <Button type="submit" disabled={loading} className="w-full py-3.5 text-base shadow-lg shadow-violet-500/20">
              <QrCode className="h-5 w-5" />
              {loading ? "QR Üretiliyor..." : localQrId ? "Değişiklikleri Kaydet" : "QR Kodu Üret"}
            </Button>
            <Button type="button" variant="secondary" onClick={validateDesign} disabled={!validation.valid}>
              Okunabilirlik Kontrolü
            </Button>
            <Button type="button" variant="secondary" onClick={() => download("png")} disabled={!!downloading || !validation.valid}>
              <Download className="h-4 w-4" />{downloading === "png" ? "İndiriliyor..." : "PNG İndir"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => download("svg")} disabled={!!downloading || !localQrId || !validation.valid}>
              <Download className="h-4 w-4" />{downloading === "svg" ? "İndiriliyor..." : "SVG İndir"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => download("pdf")} disabled={!!downloading || !localQrId || !validation.valid}>
              <Download className="h-4 w-4" />{downloading === "pdf" ? "İndiriliyor..." : "PDF İndir"}
            </Button>
          </div>
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-violet-200/80 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(91,33,182,0.12)] backdrop-blur-md md:hidden lg:pl-72">
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          {!validation.valid ? (
            <p className="text-center text-xs text-amber-800">
              {validation.errors[0] || "Zorunlu alanları doldurun"}
            </p>
          ) : null}
          {error && !displayErrors.length ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-700">{error}</p>
          ) : null}
          <Button type="submit" form="qr-create-form" disabled={loading} className="w-full py-3.5 text-base shadow-lg shadow-violet-500/25">
            <QrCode className="h-5 w-5" />
            {loading ? "QR Üretiliyor..." : localQrId ? "Kaydet" : "QR Kodu Üret"}
          </Button>
        </div>
      </div>
      <div className="h-24 md:hidden" aria-hidden />
    </>
  );
}
