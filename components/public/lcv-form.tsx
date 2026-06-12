"use client";

import { useState } from "react";
import { CheckCircle2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardBody } from "@/components/ui/card";

export default function LcvForm({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", attendance: "Katılacağım", guestCount: "1", notes: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/lcv", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, ...form }) });
    setLoading(false);
    if (res.ok) setDone(true);
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-violet-50 px-4">
        <Card className="max-w-md text-center"><CardBody className="py-10">
          <CheckCircle2 className="mx-auto h-14 w-14 text-rose-500" />
          <h1 className="mt-4 text-2xl font-bold text-violet-950">Teşekkürler!</h1>
          <p className="mt-2 text-slate-500">Katılım yanıtınız kaydedildi.</p>
        </CardBody></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-violet-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg"><Heart className="h-7 w-7" /></div>
          <h1 className="mt-4 text-3xl font-bold text-violet-950">Katılım Formu</h1>
          <p className="mt-1 text-slate-500">LCV — Lütfen katılım durumunuzu bildirin</p>
        </div>
        <Card><CardBody>
          <form onSubmit={submit} className="space-y-4">
            <label className="block"><Label>Ad Soyad</Label><Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
            <label className="block"><Label>Telefon</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <label className="block"><Label>Katılım Durumu</Label>
              <Select value={form.attendance} onChange={(e) => setForm({ ...form, attendance: e.target.value })}>
                <option>Katılacağım</option><option>Katılamayacağım</option>
              </Select>
            </label>
            <label className="block"><Label>Kişi Sayısı</Label><Input type="number" min={1} value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: e.target.value })} /></label>
            <label className="block"><Label>Not</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
            <Button disabled={loading} variant="accent" className="w-full py-3">{loading ? "Gönderiliyor..." : "Yanıtı Gönder"}</Button>
          </form>
        </CardBody></Card>
      </div>
    </div>
  );
}
