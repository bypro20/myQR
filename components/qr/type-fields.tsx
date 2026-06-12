"use client";

import { Input, Label, Select, Textarea } from "@/components/ui/input";

type Props = {
  type: string;
  payload: Record<string, unknown>;
  onChange: (payload: Record<string, unknown>) => void;
};

const SOCIAL_PLATFORMS = ["Instagram", "TikTok", "Facebook", "YouTube", "LinkedIn", "X / Twitter", "Diğer"];

export function QrTypeFields({ type, payload, onChange }: Props) {
  function set(key: string, value: unknown) {
    onChange({ ...payload, [key]: value });
  }

  switch (type) {
    case "URL":
    case "GOOGLE_MAPS":
    case "GOOGLE_REVIEW":
    case "PDF":
      return (
        <label className="block md:col-span-2">
          <Label>Bağlantı URL</Label>
          <Input value={String(payload.url || "")} onChange={(e) => set("url", e.target.value)} placeholder="https://" />
        </label>
      );
    case "SOCIAL":
      return (
        <>
          <label className="block"><Label>Platform</Label>
            <Select value={String(payload.platform || "Instagram")} onChange={(e) => set("platform", e.target.value)}>
              {SOCIAL_PLATFORMS.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </label>
          <label className="block md:col-span-2 sm:col-span-1"><Label>Profil Linki</Label>
            <Input value={String(payload.url || "")} onChange={(e) => set("url", e.target.value)} placeholder="https://instagram.com/..." />
          </label>
        </>
      );
    case "WIFI":
      return (
        <>
          <label className="block"><Label>Ağ Adı (SSID)</Label><Input value={String(payload.ssid || "")} onChange={(e) => set("ssid", e.target.value)} /></label>
          <label className="block"><Label>Şifre</Label><Input value={String(payload.password || "")} onChange={(e) => set("password", e.target.value)} /></label>
          <label className="block"><Label>Şifreleme</Label>
            <Select value={String(payload.encryption || "WPA")} onChange={(e) => set("encryption", e.target.value)}>
              <option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">Şifresiz</option>
            </Select>
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(payload.hidden)} onChange={(e) => set("hidden", e.target.checked)} className="rounded" /> Gizli ağ</label>
        </>
      );
    case "WHATSAPP":
      return (
        <>
          <label className="block"><Label>Ülke Kodu</Label><Input value={String(payload.countryCode || "90")} onChange={(e) => set("countryCode", e.target.value)} /></label>
          <label className="block"><Label>Telefon</Label><Input value={String(payload.phone || "")} onChange={(e) => set("phone", e.target.value)} /></label>
          <label className="block md:col-span-2"><Label>Hazır Mesaj</Label><Textarea rows={2} value={String(payload.message || "")} onChange={(e) => set("message", e.target.value)} /></label>
        </>
      );
    case "VCARD":
      return (
        <>
          <label className="block"><Label>Ad Soyad</Label><Input value={String(payload.fullName || "")} onChange={(e) => set("fullName", e.target.value)} /></label>
          <label className="block"><Label>Firma</Label><Input value={String(payload.company || "")} onChange={(e) => set("company", e.target.value)} /></label>
          <label className="block"><Label>Unvan</Label><Input value={String(payload.title || "")} onChange={(e) => set("title", e.target.value)} /></label>
          <label className="block"><Label>Telefon</Label><Input value={String(payload.phone || "")} onChange={(e) => set("phone", e.target.value)} /></label>
          <label className="block"><Label>E-posta</Label><Input value={String(payload.email || "")} onChange={(e) => set("email", e.target.value)} /></label>
          <label className="block md:col-span-2"><Label>Web Sitesi</Label><Input value={String(payload.website || "")} onChange={(e) => set("website", e.target.value)} /></label>
          <label className="block md:col-span-2"><Label>Adres</Label><Input value={String(payload.address || "")} onChange={(e) => set("address", e.target.value)} /></label>
          <label className="block md:col-span-2"><Label>Not</Label><Textarea rows={2} value={String(payload.note || "")} onChange={(e) => set("note", e.target.value)} /></label>
        </>
      );
    case "EMAIL":
      return (
        <>
          <label className="block md:col-span-2"><Label>E-posta</Label><Input value={String(payload.email || "")} onChange={(e) => set("email", e.target.value)} /></label>
          <label className="block"><Label>Konu</Label><Input value={String(payload.subject || "")} onChange={(e) => set("subject", e.target.value)} /></label>
          <label className="block md:col-span-2"><Label>Mesaj</Label><Textarea rows={2} value={String(payload.body || "")} onChange={(e) => set("body", e.target.value)} /></label>
        </>
      );
    case "PHONE":
      return <label className="block md:col-span-2"><Label>Telefon</Label><Input value={String(payload.phone || "")} onChange={(e) => set("phone", e.target.value)} /></label>;
    case "SMS":
      return (
        <>
          <label className="block"><Label>Telefon</Label><Input value={String(payload.phone || "")} onChange={(e) => set("phone", e.target.value)} /></label>
          <label className="block"><Label>SMS Mesajı</Label><Input value={String(payload.message || "")} onChange={(e) => set("message", e.target.value)} /></label>
        </>
      );
    case "WARRANTY":
    case "LCV":
      return type === "LCV" ? (
        <label className="block md:col-span-2"><Label>Etkinlik Tarihi</Label><Input value={String(payload.eventDate || "")} onChange={(e) => set("eventDate", e.target.value)} placeholder="12 Haziran 2026" /></label>
      ) : (
        <p className="md:col-span-2 text-sm text-slate-500">Garanti formu otomatik oluşturulur. Kayıt sonrası public form linki QR içine yazılır.</p>
      );
    default:
      return null;
  }
}
