import { NextResponse } from "next/server";
import { QrValidationError, qrValidationResponse } from "@/lib/qr/validate-input";

export function handleQrWriteError(err: unknown) {
  if (err instanceof QrValidationError) {
    return NextResponse.json(qrValidationResponse(err.errors), { status: 400 });
  }

  const message = err instanceof Error ? err.message : "QR işlemi başarısız.";
  const status =
    message === "INSUFFICIENT_CREDITS" ? 402 :
    message === "QR_LIMIT_REACHED" ? 403 :
    message === "PLAN_NO_DYNAMIC" ? 403 :
    message === "PLAN_NO_WARRANTY_LCV" ? 403 :
    message === "PLAN_NO_BULK" ? 403 : 500;

  const error =
    message === "INSUFFICIENT_CREDITS"
      ? "Yetersiz kredi. Süre uzatmak veya kalıcı QR için kredi paketi alın."
      : message === "QR_LIMIT_REACHED"
        ? "Plan QR limitine ulaşıldı."
        : message === "PLAN_NO_DYNAMIC"
          ? "Planınız dinamik QR desteklemiyor."
          : message === "PLAN_NO_WARRANTY_LCV"
            ? "Planınız garanti/LCV formlarını desteklemiyor."
            : message === "PLAN_NO_BULK"
              ? "Planınız toplu QR üretimini desteklemiyor."
              : message === "INVALID_DURATION_TIER"
                ? "Geçersiz süre seçimi."
                : message === "DURATION_TIER_NOT_ALLOWED"
                  ? "Bu süre için yeterli krediniz yok. Paket alın veya daha kısa süre seçin."
                  : "QR işlemi başarısız.";

  return NextResponse.json({ error }, { status });
}
