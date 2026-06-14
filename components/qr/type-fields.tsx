"use client";

import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { getCatalogEntry } from "@/lib/qr/catalog";
import {
  getBankByCode,
  getBankScanHint,
  resolveBankFromIban,
  syncIbanPayload,
} from "@/lib/qr/turkish-banks";

type Props = {
  type: string;
  payload: Record<string, unknown>;
  onChange: (payload: Record<string, unknown>) => void;
};

export function QrTypeFields({ type, payload, onChange }: Props) {
  const entry = getCatalogEntry(type);

  function set(key: string, value: unknown) {
    onChange({ ...payload, [key]: value });
  }

  function setIban(value: string) {
    onChange(syncIbanPayload({ ...payload, iban: value }));
  }

  if (!entry || entry.fields.length === 0) {
    if (type === "WARRANTY") {
      return (
        <p className="md:col-span-2 text-sm text-slate-500">
          Garanti formu otomatik oluşturulur. Kayıt sonrası public form linki QR içine yazılır.
        </p>
      );
    }
    return null;
  }

  const ibanClean =
    type === "IBAN" ? String(payload.iban || "").replace(/\s/g, "").toUpperCase() : "";
  const ibanReady = ibanClean.startsWith("TR") && ibanClean.length === 26;
  const detectedBank = ibanReady ? resolveBankFromIban(ibanClean) : null;
  const bankCode = String(detectedBank?.code || payload.bankCode || "");
  const bankHint = type === "IBAN" && bankCode ? getBankScanHint(bankCode) : "";

  return (
    <>
      {entry.fields.map((field) => {
        const colClass = field.colSpan === 2 ? "md:col-span-2" : "";
        const value = payload[field.key];

        if (field.type === "bank") {
          return (
            <label key={field.key} className={`block ${colClass}`}>
              <Label>{field.label}</Label>
              <Input
                type="text"
                readOnly
                value={detectedBank?.name || (ibanReady ? "Banka tanınamadı" : "IBAN girince otomatik belirlenir")}
                className="bg-slate-50 text-slate-700"
              />
              {bankHint ? (
                <p className="mt-1.5 rounded-lg bg-violet-50 px-2.5 py-2 text-xs text-violet-800">
                  <span className="font-semibold">{detectedBank?.name}:</span> {bankHint}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-slate-500">
                Bu alan IBAN numarasından otomatik gelir. Ödemeyi gönderen kişi Enpara, Ziraat vb. kullanabilir — QR tüm bankalarda okunur.
              </p>
            </label>
          );
        }

        if (field.type === "checkbox") {
          return (
            <label key={field.key} className={`flex items-center gap-2 ${colClass}`}>
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => set(field.key, e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-slate-700">{field.label}</span>
            </label>
          );
        }

        if (field.type === "select") {
          return (
            <label key={field.key} className={`block ${colClass}`}>
              <Label>{field.label}</Label>
              <Select
                value={String(value ?? field.options?.[0]?.value ?? "")}
                onChange={(e) => set(field.key, e.target.value)}
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              {field.key === "paymentScene" && bankCode ? (
                <p className="mt-1 text-xs text-slate-500">
                  {getBankByCode(bankCode)?.name} için önerilen format otomatik seçildi; gerekirse değiştirebilirsiniz.
                </p>
              ) : null}
            </label>
          );
        }

        if (field.type === "textarea") {
          return (
            <label key={field.key} className={`block ${colClass}`}>
              <Label>{field.label}</Label>
              <Textarea
                rows={3}
                value={String(value ?? "")}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={field.placeholder}
              />
            </label>
          );
        }

        if (field.key === "iban" && type === "IBAN") {
          return (
            <label key={field.key} className={`block ${colClass}`}>
              <Label>{field.label}</Label>
              <Input
                type="text"
                value={String(value ?? "")}
                onChange={(e) => setIban(e.target.value)}
                placeholder={field.placeholder}
              />
            </label>
          );
        }

        return (
          <label key={field.key} className={`block ${colClass}`}>
            <Label>{field.label}</Label>
            <Input
              type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : field.type === "number" ? "number" : "text"}
              value={String(value ?? "")}
              onChange={(e) => set(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          </label>
        );
      })}
    </>
  );
}
