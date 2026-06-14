"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Megaphone,
  PlayCircle,
  Radio,
  Sparkles,
  XCircle,
  Zap,
} from "lucide-react";
import type { GoogleAdsAdminStatus } from "@/lib/admin/google-ads-status";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "myqr-ads-budget";

function copyText(text: string) {
  void navigator.clipboard.writeText(text);
}

export function AdminAdsPanel() {
  const [status, setStatus] = useState<GoogleAdsAdminStatus | null>(null);
  const [budget, setBudget] = useState(150);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setBudget(Number(saved) || 150);
    fetch("/api/admin/ads/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  function saveBudget(v: number) {
    setBudget(v);
    localStorage.setItem(STORAGE_KEY, String(v));
  }

  function copy(id: string, text: string) {
    copyText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const trackingOk = status?.trackingActive && status?.signupTracking;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reklam Merkezi"
        description="Google Ads sürekli reklam yönetimi — tek panelden durum, kolay kurulum ve kampanya paketi"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={cn(trackingOk ? "border-emerald-200 bg-emerald-50/30" : "border-amber-200 bg-amber-50/30")}>
          <CardBody className="flex items-start gap-3">
            {trackingOk ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <XCircle className="h-6 w-6 text-amber-600" />}
            <div>
              <p className="font-bold text-violet-950">Site dönüşüm takibi</p>
              <p className="mt-1 text-sm text-slate-600">
                {trackingOk ? "Kayıt etiketi aktif — reklam performansı ölçülebilir." : "Google AW- ID bekleniyor. ID gelince otomatik aktif olur."}
              </p>
              {status?.adsId ? <p className="mt-1 font-mono text-xs text-slate-500">{status.adsId}</p> : null}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-start gap-3">
            <Radio className="h-6 w-6 text-violet-600" />
            <div>
              <p className="font-bold text-violet-950">Sürekli reklam</p>
              <p className="mt-1 text-sm text-slate-600">
                Kampanya <strong>Açık</strong> + günlük bütçe varsa Google 7/24 otomatik gösterir. Her gün yeniden açmanız gerekmez.
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-start gap-3">
            <Zap className="h-6 w-6 text-orange-500" />
            <div>
              <p className="font-bold text-violet-950">Önerilen mod</p>
              <p className="mt-1 text-sm text-slate-600">
                <strong>Performance Max</strong> — en az uğraş, Google görsel/metin/kitleyi optimize eder.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="overflow-hidden border-violet-200">
        <CardHeader className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              <h2 className="text-lg font-bold text-violet-950">En kolay yöntem — Performance Max (7/24)</h2>
            </div>
            <Badge variant="success">Önerilen</Badge>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          <p className="text-sm text-slate-600">
            Kartınız zaten ekli. Tek kampanya açın, bütçe belirleyin, unutun — Google myqar.net için sürekli reklam gösterir.
          </p>
          <ol className="space-y-3 text-sm text-slate-700">
            {[
              "ads.google.com → + Yeni kampanya → Hedef: Potansiyel müşteri / Satış",
              "Kampanya türü: Performance Max",
              "Final URL: https://myqar.net/signup",
              "Günlük bütçe: aşağıdaki kaydırıcıdan seçtiğiniz tutar",
              "Varlık grubu: myqar.net logosu + 5 başlık + 3 açıklama (aşağıdan kopyala)",
              "Dönüşüm: Kayıt (signup) — site etiketi bağlı olunca otomatik sayar",
              "Yayınla → Kampanya durumu: Açık kalsın",
            ].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <div className="rounded-xl border border-violet-100 bg-white p-4">
            <label className="text-sm font-semibold text-violet-950">Günlük bütçe planı (₺)</label>
            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={budget}
              onChange={(e) => saveBudget(Number(e.target.value))}
              className="mt-3 w-full accent-violet-600"
            />
            <p className="mt-2 text-2xl font-extrabold text-violet-700">{budget} ₺ / gün</p>
            <p className="text-xs text-slate-500">Ayda yaklaşık {(budget * 30).toLocaleString("tr-TR")} ₺ · Google bu limiti aşmaz</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <CopyBlock
              title="Performance Max başlıkları"
              id="pmax-headlines"
              copied={copied}
              onCopy={copy}
              text={[
                "Profesyonel QR Platformu",
                "14 Gün Pro Denemesi",
                "25 Hoş Geldin Kredisi",
                "Dinamik QR Oluştur",
                "Kredi Kartı Gerekmez",
              ].join("\n")}
            />
            <CopyBlock
              title="Performance Max açıklamaları"
              id="pmax-desc"
              copied={copied}
              onCopy={copy}
              text={[
                "Dinamik QR, toplu üretim ve analitik — tek panelde. myqar.net",
                "Matbaa ve ajanslar için 45+ QR formatı. Hemen ücretsiz başlayın.",
                "15 gün QR denemesi. Süre paketleri ve kalıcı lisans mevcut.",
              ].join("\n")}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://ads.google.com/aw/campaigns/new"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand inline-flex px-5 py-2.5"
            >
              <PlayCircle className="h-4 w-4" />
              Google Ads&apos;te kampanya aç
            </a>
            <a href="https://ads.google.com/aw/conversions" target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex px-5 py-2.5">
              <ExternalLink className="h-4 w-4" />
              Dönüşümler
            </a>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold text-violet-950">Gelişmiş — 4 Arama kampanyası paketi</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Daha fazla kontrol isteyenler için. Bütçe otomatik dağılımı:</p>
        </CardHeader>
        <CardBody className="space-y-4">
          {status?.budgetSplit.map((row) => (
            <div key={row.campaign} className="flex items-center justify-between rounded-xl bg-violet-50/50 px-4 py-3 text-sm">
              <span className="font-medium text-violet-950">{row.campaign}</span>
              <span className="font-bold text-violet-700">
                {Math.round((row.dailyTry / (status?.dailyBudgetTry || 150)) * budget)} ₺/gün
              </span>
            </div>
          )) || null}
          {status?.campaigns.map((c) => (
            <details key={c.id} className="rounded-xl border border-violet-100 p-4">
              <summary className="cursor-pointer font-semibold text-violet-950">{c.name}</summary>
              <p className="mt-2 text-xs text-slate-500">URL: {c.finalUrl}</p>
              <p className="mt-2 text-xs text-slate-600">Kelimeler: {c.keywords.join(", ")}</p>
              <Button type="button" variant="secondary" className="mt-3 text-xs" onClick={() => copy(c.id, c.headlines.join("\n"))}>
                <Copy className="h-3.5 w-3.5" />
                {copied === c.id ? "Kopyalandı" : "Başlıkları kopyala"}
              </Button>
            </details>
          )) || null}
          <CopyBlock
            title="Negatif anahtar kelimeler (tüm kampanyalara)"
            id="neg"
            copied={copied}
            onCopy={copy}
            text={(status?.negativeKeywords || []).join("\n")}
          />
        </CardBody>
      </Card>

      <Card className="border-dashed border-slate-300 bg-slate-50/50">
        <CardBody>
          <p className="font-semibold text-slate-800">Yakında: Tek tıkla Google bağlantısı</p>
          <p className="mt-2 text-sm text-slate-600">
            myQR admin panelinden bütçe değiştirme, kampanyayı duraklatma ve harcama raporu — Google Ads API ile entegre edilecek.
            Şimdilik en pratik yol: yukarıdaki <strong>Performance Max</strong> + site dönüşüm etiketi.
          </p>
          <Link href="/admin/sales" className="mt-3 inline-flex text-sm font-semibold text-violet-600 hover:underline">
            Satış panelinde kayıt/ödeme takibi →
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}

function CopyBlock({
  title,
  id,
  text,
  copied,
  onCopy,
}: {
  title: string;
  id: string;
  text: string;
  copied: string | null;
  onCopy: (id: string, text: string) => void;
}) {
  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-violet-950">{title}</p>
        <button type="button" onClick={() => onCopy(id, text)} className="text-xs font-bold text-violet-600 hover:underline">
          {copied === id ? "✓ Kopyalandı" : "Kopyala"}
        </button>
      </div>
      <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-xs text-slate-600">{text}</pre>
    </div>
  );
}
