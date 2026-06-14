"use client";

import { Button } from "@/components/ui/button";

export default function AdminSalesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-lg font-bold text-red-900">Ödeme paneli yüklenemedi</p>
      <p className="mt-2 text-sm text-red-800">{error.message || "Beklenmeyen bir hata oluştu."}</p>
      <Button className="mt-6" variant="accent" onClick={reset}>
        Yeniden dene
      </Button>
    </div>
  );
}
