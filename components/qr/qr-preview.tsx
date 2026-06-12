"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_DESIGN, type QrDesign } from "@/lib/qr/types";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export function QrPreview({
  type,
  mode,
  targetUrl,
  payload,
  design,
}: {
  type: string;
  mode: string;
  targetUrl: string;
  payload: Record<string, unknown>;
  design: QrDesign;
}) {
  const [src, setSrc] = useState<string | null>(null);

  const body = useMemo(
    () => JSON.stringify({ type, mode, targetUrl, payload, design }),
    [type, mode, targetUrl, payload, design],
  );

  useEffect(() => {
    let active = true;
    async function load() {
      const res = await fetch("/api/qr/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok || !active) return;
      const blob = await res.blob();
      setSrc(URL.createObjectURL(blob));
    }
    const t = setTimeout(load, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [body]);

  return (
    <Card>
      <CardHeader>
        <p className="font-semibold text-violet-950">Canlı Önizleme</p>
        <p className="text-xs text-slate-500">Baskı öncesi QR görünümü</p>
      </CardHeader>
      <CardBody className="flex flex-col items-center">
        <div
          className="flex items-center justify-center rounded-2xl border border-violet-100 p-6"
          style={{ backgroundColor: design.backgroundColor || DEFAULT_DESIGN.backgroundColor }}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="QR önizleme" className="h-48 w-48 object-contain" />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center text-sm text-slate-400">Yükleniyor...</div>
          )}
        </div>
        {design.title ? <p className="mt-4 text-center font-semibold text-violet-950">{design.title}</p> : null}
        {design.caption ? <p className="mt-1 text-center text-sm text-slate-500">{design.caption}</p> : null}
      </CardBody>
    </Card>
  );
}
