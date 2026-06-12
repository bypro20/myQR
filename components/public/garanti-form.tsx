"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";

export default function GarantiForm({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: "", phone: "", email: "", productName: "", productModel: "",
    serialNumber: "", purchaseDate: "", invoiceNumber: "", purchasedFrom: "",
    warrantyStart: "", warrantyEnd: "", notes: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/warranty", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, ...form }) });
    setLoading(false);
    if (res.ok) setDone(true);
  }

  if (done) {
    return (
      <div className="gradient-hero flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-md text-center"><CardBody className="py-10">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
          <h1 className="mt-4 text-2xl font-bold text-violet-950">Kayıt Alındı</h1>
          <p className="mt-2 text-slate-500">Garanti aktivasyonunuz başarıyla kaydedildi.</p>
        </CardBody></Card>
      </div>
    );
  }

  const fields: Array<[keyof typeof form, string, boolean?]> = [
    ["customerName", "Ad Soyad", true], ["phone", "Telefon", true], ["email", "E-posta", true],
    ["productName", "Ürün Adı", true], ["productModel", "Ürün Modeli"], ["serialNumber", "Seri Numarası", true],
    ["purchaseDate", "Satın Alma Tarihi"], ["invoiceNumber", "Fatura Numarası"], ["purchasedFrom", "Satın Alınan Firma"],
    ["warrantyStart", "Garanti Başlangıç"], ["warrantyEnd", "Garanti Bitiş"],
  ];

  return (
    <div className="gradient-hero min-h-screen px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg"><ShieldCheck className="h-7 w-7" /></div>
          <h1 className="mt-4 text-3xl font-bold text-violet-950">Garanti Aktivasyon</h1>
          <p className="mt-1 text-slate-500">Ürün garantinizi birkaç adımda aktive edin</p>
        </div>
        <Card><CardBody>
          <form onSubmit={submit} className="space-y-4">
            {fields.map(([key, label, required]) => (
              <label key={key} className="block">
                <Label>{label}</Label>
                <Input required={required} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </label>
            ))}
            <label className="block"><Label>Not</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
            <Button disabled={loading} className="w-full py-3">{loading ? "Gönderiliyor..." : "Garantiyi Aktive Et"}</Button>
          </form>
        </CardBody></Card>
      </div>
    </div>
  );
}
