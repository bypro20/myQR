"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { buildFrameSvg } from "@/lib/qr/frame";
import { DEFAULT_DESIGN, type QrDesign } from "@/lib/qr/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type Props = {
  encodedContent: string;
  design: QrDesign;
  validationErrors?: string[];
  canPreview?: boolean;
};

export function QrPreview({
  encodedContent,
  design,
  validationErrors = [],
  canPreview = true,
}: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const mergedDesign = useMemo(() => ({ ...DEFAULT_DESIGN, ...design }), [design]);
  const designKey = useMemo(() => JSON.stringify(mergedDesign), [mergedDesign]);
  const validationBlocked = validationErrors.length > 0 || !canPreview || !encodedContent.trim();
  const framed = mergedDesign.frameEnabled !== false && mergedDesign.frameStyle !== "none";

  useEffect(() => {
    if (validationBlocked) {
      setSrc(null);
      setPreviewError([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setPreviewError([]);

    async function render() {
      try {
        const rawSvg = await QRCode.toString(encodedContent, {
          type: "svg",
          errorCorrectionLevel: mergedDesign.errorCorrectionLevel,
          margin: mergedDesign.margin,
          color: {
            dark: mergedDesign.foregroundColor,
            light: mergedDesign.backgroundColor,
          },
          width: mergedDesign.size,
        });
        const svg = buildFrameSvg(rawSvg, mergedDesign);
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        if (!active) return;
        setSrc(dataUrl);
        setLoading(false);
      } catch (err) {
        if (!active) return;
        setPreviewError([
          err instanceof Error ? err.message : "Önizleme oluşturulamadı — alanları kontrol edin.",
        ]);
        setSrc(null);
        setLoading(false);
      }
    }

    const t = setTimeout(render, 120);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [encodedContent, designKey, validationBlocked, mergedDesign]);

  const validationErrorsShown = validationBlocked ? validationErrors : [];
  const errors = validationErrorsShown.length ? validationErrorsShown : previewError;
  const ready = !errors.length && !!src;

  const subtitle = validationErrorsShown.length
    ? `${validationErrorsShown.length} zorunlu alan eksik`
    : previewError.length
      ? "Önizleme oluşturulamadı"
      : ready
        ? framed
          ? "Profesyonel çerçeveli baskı önizlemesi"
          : "Baskı öncesi QR görünümü"
        : loading
          ? "Önizleme hazırlanıyor..."
          : "Alanları doldurun";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-violet-950">Canlı Önizleme</p>
          {ready ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              Hazır
            </span>
          ) : null}
        </div>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </CardHeader>
      <CardBody className="flex flex-col items-center">
        <div className="flex w-full min-h-[280px] items-center justify-center rounded-2xl border border-violet-100 bg-slate-50 p-4">
          {errors.length ? (
            <div className="flex flex-col items-center justify-center gap-2 px-3 text-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <p className="text-xs font-semibold text-red-700">
                {validationErrorsShown.length ? "Zorunlu alanlar eksik" : "Önizleme üretilemedi"}
              </p>
            </div>
          ) : src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="QR önizleme" className="max-h-[420px] max-w-full object-contain drop-shadow-md" />
          ) : (
            <div className="flex items-center justify-center text-sm text-slate-400">
              {loading ? "Yükleniyor..." : "—"}
            </div>
          )}
        </div>

        {errors.length ? (
          <ul className="mt-4 w-full space-y-1.5 rounded-xl border border-red-200 bg-red-50 p-3 text-left text-xs text-red-700">
            {errors.map((msg) => (
              <li key={msg} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                {msg}
              </li>
            ))}
          </ul>
        ) : null}
      </CardBody>
    </Card>
  );
}
