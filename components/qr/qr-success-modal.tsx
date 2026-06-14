"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Pencil,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { QR_TYPE_LABELS } from "@/lib/qr/types";
import { triggerDirectDownload } from "@/lib/download-client";
import { Button } from "@/components/ui/button";

export type QrSuccessData = {
  id: string;
  name: string;
  type: string;
  mode: string;
  shortCode: string | null;
  targetUrl?: string | null;
};

type Props = {
  data: QrSuccessData;
  appUrl: string;
  onClose: () => void;
  isNew?: boolean;
};

export function QrSuccessModal({ data, appUrl, onClose, isNew = true }: Props) {
  const [copied, setCopied] = useState(false);
  const safeName = (data.name || "qr").replace(/\s+/g, "-");
  const scanUrl = data.shortCode ? `${appUrl}/q/${data.shortCode}` : null;
  const imageUrl = `/api/qr/${data.id}/export?format=png&inline=1&t=${data.id}`;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function copyLink() {
    if (!scanUrl) return;
    void navigator.clipboard.writeText(scanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function download(format: "png" | "svg" | "pdf") {
    triggerDirectDownload(`/api/qr/${data.id}/export?format=${format}`, `${safeName}.${format}`);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-[2rem] bg-white shadow-2xl shadow-violet-500/20">
        <div className="relative rounded-t-[2rem] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 px-8 pb-20 pt-8 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/15 p-2 transition hover:bg-white/25"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 text-violet-100">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">
              {isNew ? "Üretim tamamlandı" : "Güncellendi"}
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight">
            {isNew ? "QR kodunuz hazır!" : "Değişiklikler kaydedildi"}
          </h2>
          <p className="mt-2 text-sm text-violet-100/90">
            Hemen test edin, indirin veya baskıya gönderin.
          </p>
        </div>

        <div className="relative -mt-14 px-8 pb-8">
          <div className="mx-auto w-full max-w-[280px] rounded-3xl border border-violet-100 bg-white p-4 shadow-xl">
            <div className="flex w-full items-center justify-center rounded-2xl bg-slate-50 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={`${data.name} QR kodu`}
                className="max-h-[320px] max-w-full object-contain"
              />
            </div>
            <p className="mt-4 text-center text-sm font-bold text-violet-950">{data.name}</p>
            <p className="text-center text-xs text-slate-500">
              {QR_TYPE_LABELS[data.type] || data.type} · {data.mode === "DYNAMIC" ? "Dinamik" : "Statik"}
            </p>
          </div>

          {scanUrl ? (
            <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Kısa link</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded-xl bg-white px-3 py-2 text-xs text-violet-900">{scanUrl}</code>
                <button
                  type="button"
                  onClick={copyLink}
                  className="shrink-0 rounded-xl border border-violet-200 bg-white p-2.5 text-violet-700 transition hover:bg-violet-50"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              {copied ? <p className="mt-1 text-xs font-medium text-emerald-600">Kopyalandı!</p> : null}
            </div>
          ) : null}

          {data.targetUrl && data.mode === "DYNAMIC" ? (
            <p className="mt-3 text-center text-xs text-slate-500">
              Tarama hedefi: <span className="font-mono text-violet-700">{data.targetUrl}</span>
            </p>
          ) : null}

          <div className="mt-6 grid grid-cols-2 gap-2">
            {scanUrl ? (
              <a
                href={scanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:opacity-95"
              >
                <ExternalLink className="h-4 w-4" />
                Hemen dene
              </a>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => download("png")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-semibold text-violet-800 transition hover:bg-violet-50"
            >
              <Download className="h-4 w-4" />
              PNG indir
            </button>
            <button
              type="button"
              onClick={() => download("svg")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-semibold text-violet-800 transition hover:bg-violet-50"
            >
              <Download className="h-4 w-4" />
              SVG indir
            </button>
            <button
              type="button"
              onClick={() => download("pdf")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-semibold text-violet-800 transition hover:bg-violet-50"
            >
              <Download className="h-4 w-4" />
              PDF indir
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              <Pencil className="h-4 w-4" />
              Düzenlemeye devam
            </Button>
            {isNew ? (
              <Link href="/dashboard/qr/new" className="btn-outline flex-1 justify-center py-3 text-sm">
                <Plus className="h-4 w-4" />
                Yeni QR oluştur
              </Link>
            ) : null}
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Baskıya hazır — PNG, SVG veya PDF indirebilirsiniz
          </p>
        </div>
      </div>
    </div>
  );
}
