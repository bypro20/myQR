"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BulkPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/qr/bulk", { method: "POST", body: new FormData(e.currentTarget) });
    setLoading(false);
    if (!res.ok) { setMessage("Toplu üretim başarısız."); return; }
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `myqr-bulk-${Date.now()}.zip`;
    a.click();
    setMessage(`ZIP indirildi — ${res.headers.get("X-QR-Count") || "?"} QR kod`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Toplu QR Üretimi" description="CSV yükleyin, yüzlerce QR kodu tek seferde ZIP olarak indirin" />
      <Card>
        <CardBody className="space-y-5">
          <div className="flex items-start gap-4 rounded-2xl bg-violet-50 p-4">
            <FileSpreadsheet className="mt-0.5 h-5 w-5 text-violet-600" />
            <div className="text-sm text-slate-600">
              <p className="font-semibold text-violet-950">CSV sütunları</p>
              <p className="mt-1">QR adı, QR tipi, Hedef bağlantı, Ürün adı, Seri numarası, Açıklama, Müşteri adı</p>
            </div>
          </div>
          <form onSubmit={upload} className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/30 px-6 py-10 transition hover:border-violet-400 hover:bg-violet-50">
              <Upload className="h-8 w-8 text-violet-500" />
              <span className="mt-3 text-sm font-medium text-violet-800">CSV dosyası seçin</span>
              <input type="file" name="file" accept=".csv" required className="mt-4 text-sm" />
            </label>
            <Button disabled={loading} className="w-full py-3">{loading ? "Üretiliyor..." : "CSV Yükle ve ZIP İndir"}</Button>
          </form>
          {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}
        </CardBody>
      </Card>
    </div>
  );
}
