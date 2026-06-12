"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { BioLink } from "@/lib/qr/types";

type Props = {
  payload: Record<string, unknown>;
  onChange: (payload: Record<string, unknown>) => void;
};

export function LinkBioFields({ payload, onChange }: Props) {
  const links = (payload.links as BioLink[]) || [{ label: "Web Sitesi", url: "" }];

  function updateLinks(next: BioLink[]) {
    onChange({ ...payload, links: next });
  }

  return (
    <div className="space-y-4 md:col-span-2">
      <label className="block"><Label>Bio Açıklaması</Label>
        <Input value={String(payload.description || "")} onChange={(e) => onChange({ ...payload, description: e.target.value })} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label><Label>Arka Plan Rengi</Label>
          <input type="color" value={String(payload.bgColor || "#ffffff")} onChange={(e) => onChange({ ...payload, bgColor: e.target.value })} className="h-11 w-full rounded-xl border border-violet-200" />
        </label>
        <label><Label>Buton Rengi</Label>
          <input type="color" value={String(payload.buttonColor || "#7c3aed")} onChange={(e) => onChange({ ...payload, buttonColor: e.target.value })} className="h-11 w-full rounded-xl border border-violet-200" />
        </label>
      </div>
      <div>
        <Label>Bio Linkleri</Label>
        <div className="mt-2 space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <Input placeholder="Buton adı" value={link.label} onChange={(e) => { const n = [...links]; n[i] = { ...link, label: e.target.value }; updateLinks(n); }} />
              <Input placeholder="https://" value={link.url} onChange={(e) => { const n = [...links]; n[i] = { ...link, url: e.target.value }; updateLinks(n); }} />
              <button type="button" onClick={() => updateLinks(links.filter((_, j) => j !== i))} className="rounded-xl border border-red-200 px-3 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" className="mt-3" onClick={() => updateLinks([...links, { label: "Yeni Link", url: "" }])}>
          <Plus className="h-4 w-4" /> Link Ekle
        </Button>
      </div>
    </div>
  );
}
