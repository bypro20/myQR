"use client";

import { useEffect, useRef } from "react";

export function PosnetRedirectForm({
  action,
  fields,
}: {
  action: string;
  fields: Record<string, string>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.submit();
  }, []);

  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <div className="rounded-2xl border border-violet-100 bg-white p-8 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">Güvenli ödeme</p>
        <h1 className="mt-3 text-2xl font-bold text-[var(--ink)]">Yapı Kredi ödeme sayfasına yönlendiriliyorsunuz</h1>
        <p className="mt-3 text-sm text-[var(--ink-muted)]">
          Kart bilgilerinizi bankanın ortak ödeme sayfasında gireceksiniz. Lütfen bekleyin…
        </p>
        <form ref={formRef} method="POST" action={action} className="mt-8">
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <button
            type="submit"
            className="btn-gradient w-full py-3 text-sm"
          >
            Ödeme sayfasına git
          </button>
        </form>
      </div>
    </div>
  );
}
