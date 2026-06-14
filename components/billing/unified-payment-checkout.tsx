"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  Landmark,
  QrCode,
  Shield,
} from "lucide-react";
import { PaymentBadges } from "@/components/site/payment-badges";
import { cn } from "@/lib/utils";

type OrderInfo = {
  id: string;
  amountTry: number;
  credits: number;
  packageName: string;
  referenceCode: string;
  status: string;
  orderType?: "credits" | "subscription";
  period?: string;
};

type BankInfo = {
  iban: string;
  accountName: string;
  bankName: string;
} | null;

type Props = {
  order: OrderInfo;
  bank: BankInfo;
  cardEnabled: boolean;
  cardProvider: "posnet" | "iyzico" | null;
  fastEnabled: boolean;
};

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="break-all font-mono text-sm font-semibold text-[var(--ink)]">{value}</p>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg border border-violet-100 p-2 text-violet-600 hover:bg-violet-50"
          aria-label={`${label} kopyala`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function UnifiedPaymentCheckout({
  order,
  bank,
  cardEnabled,
  cardProvider,
  fastEnabled,
}: Props) {
  const router = useRouter();
  const [cardLoading, setCardLoading] = useState(false);
  const [fastLoading, setFastLoading] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "info" | "error">("info");
  const awaiting = order.status === "AWAITING_CONFIRMATION";
  const completed = order.status === "COMPLETED";
  const isSubscription = order.orderType === "subscription";

  const summaryLine = isSubscription
    ? `${order.packageName} · ${order.credits.toLocaleString("tr-TR")} kredi / ${order.period ?? "ay"} · `
    : `${order.packageName} · ${order.credits.toLocaleString("tr-TR")} kredi · `;

  async function payWithCard() {
    if (!legalAccepted) {
      setMessageTone("error");
      setMessage("Devam etmek için sözleşmeleri okuyup onaylamanız gerekir.");
      return;
    }
    setCardLoading(true);
    setMessage("");
    const res = await fetch("/api/billing/card/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    const data = await res.json();
    setCardLoading(false);
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
      return;
    }
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }
    setMessageTone("error");
    setMessage(data.error || "Kart ödemesi başlatılamadı.");
  }

  async function claimFastPaid() {
    if (!legalAccepted) {
      setMessageTone("error");
      setMessage("Devam etmek için sözleşmeleri okuyup onaylamanız gerekir.");
      return;
    }
    setFastLoading(true);
    setMessage("");
    const res = await fetch("/api/billing/fast/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    const data = await res.json();
    setFastLoading(false);
    if (!res.ok) {
      setMessageTone("info");
      setMessage(data.error || "Bildirim gönderilemedi.");
      return;
    }
    setMessageTone("success");
    setMessage(data.message);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-5 py-10">
      <Link
        href="/dashboard/billing"
        className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Faturalandırma
      </Link>

      <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-md">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Ödeme</h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          {summaryLine}
          <strong className="text-[var(--ink)]">{order.amountTry.toLocaleString("tr-TR")} ₺</strong>
        </p>
      </div>

      {message && (
        <p
          className={cn(
            "rounded-xl border px-4 py-3 text-sm font-medium",
            messageTone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
            messageTone === "error" && "border-red-200 bg-red-50 text-red-800",
            messageTone === "info" && "border-amber-200 bg-amber-50 text-amber-900",
          )}
        >
          {message}
        </p>
      )}

      {completed ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          {isSubscription
            ? "Ödeme onaylandı, aboneliğiniz aktif edildi ve aylık krediler yüklendi."
            : "Ödeme onaylandı, krediler hesabınıza yüklendi."}
        </div>
      ) : (
        <div className="space-y-6">
          {cardEnabled && (
            <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white">
                  <CreditCard className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Kart ile öde</p>
                  <h2 className="mt-1 text-lg font-bold text-[var(--ink)]">Kredi kartı · Banka kartı · Troy</h2>
                  <p className="mt-2 text-sm text-[var(--ink-muted)]">
                    Visa, Mastercard, Troy ve tüm banka kartları. 3D Secure güvenli ödeme sayfasına yönlendirilirsiniz;
                    onay sonrası kredi anında yüklenir.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase text-violet-700">
                    <span className="rounded-full bg-white px-2.5 py-1">Kredi kartı</span>
                    <span className="rounded-full bg-white px-2.5 py-1">Banka kartı</span>
                    <span className="rounded-full bg-white px-2.5 py-1">Taksit</span>
                  </div>
                  <button
                    type="button"
                    onClick={payWithCard}
                    disabled={cardLoading}
                    className="btn-gradient mt-5 w-full py-3.5 text-sm disabled:opacity-60 sm:w-auto sm:px-8"
                  >
                    {cardLoading ? "Yönlendiriliyor…" : "Kart ile öde"}
                  </button>
                  <p className="mt-2 flex items-center gap-1 text-xs text-violet-600/80">
                    <Shield className="h-3.5 w-3.5" />
                    {cardProvider === "posnet" ? "Yapı Kredi güvenli ödeme" : "iyzico güvenli ödeme"}
                  </p>
                </div>
              </div>
            </section>
          )}

          {fastEnabled && bank && (
            <section className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <Landmark className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">FAST / Havale</p>
                  <h2 className="mt-1 text-lg font-bold text-[var(--ink)]">Tüm bankalardan transfer</h2>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto]">
                <div className="space-y-3">
                  <CopyField label="IBAN" value={bank.iban} />
                  <CopyField label="Alıcı" value={bank.accountName} />
                  <CopyField label="Tutar" value={`${order.amountTry.toLocaleString("tr-TR")} TL`} />
                  <CopyField label="Açıklama (zorunlu)" value={order.referenceCode} />
                </div>
                <div className="flex flex-col items-center rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                  <QrCode className="h-5 w-5 text-amber-700" />
                  <p className="mt-1 text-xs font-bold text-amber-900">TR Karekod (FAST)</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/billing/fast/qr/${order.id}`}
                    alt="FAST ödeme QR kodu"
                    width={180}
                    height={180}
                    className="mt-2 rounded-lg border bg-white p-2"
                  />
                  <p className="mt-2 max-w-[13rem] text-center text-[10px] leading-relaxed text-amber-900">
                    Siyah-beyaz banka QR&apos;ı — telefon kamerası değil,{" "}
                    <strong>banka uygulaması içinden</strong> okutun.
                  </p>
                  <ol className="mt-2 max-w-[13rem] space-y-1 text-left text-[10px] leading-relaxed text-amber-900">
                    <li>Enpara: <strong>Para Gönder → Karekod ile Öde</strong></li>
                    <li>Diğer bankalar: <strong>TR Karekod / QR ile transfer</strong></li>
                    <li>IBAN ve tutar otomatik dolar</li>
                    <li>Açıklamaya <strong>{order.referenceCode}</strong> yazın</li>
                  </ol>
                </div>
              </div>

              {!awaiting ? (
                <button
                  type="button"
                  onClick={claimFastPaid}
                  disabled={fastLoading}
                  className="btn-outline mt-5 w-full py-3 text-sm disabled:opacity-60"
                >
                  {fastLoading ? "Gönderiliyor…" : "FAST yaptım — bildir"}
                </button>
              ) : (
                <p className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900">
                  Transfer bildiriminiz alındı. Hesapta görüldüğünde admin onayı ile kredi yüklenecek.
                </p>
              )}
            </section>
          )}

          {!cardEnabled && !fastEnabled && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Ödeme yöntemi yapılandırılmadı. Destek ile iletişime geçin.
            </p>
          )}

          {!completed && (cardEnabled || fastEnabled) ? (
            <div className="rounded-xl border border-[var(--line)] bg-white p-4">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--ink-muted)]">
                <input
                  type="checkbox"
                  checked={legalAccepted}
                  onChange={(e) => setLegalAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                />
                <span>
                  <Link href="/mesafeli-satis-sozlesmesi" target="_blank" className="font-medium text-violet-600 hover:underline">
                    Mesafeli Satış Sözleşmesi
                  </Link>
                  ,{" "}
                  <Link href="/teslimat-iade" target="_blank" className="font-medium text-violet-600 hover:underline">
                    Teslimat ve İade Şartları
                  </Link>{" "}
                  ile{" "}
                  <Link href="/gizlilik-politikasi" target="_blank" className="font-medium text-violet-600 hover:underline">
                    Gizlilik Politikası
                  </Link>
                  &apos;nı okudum. Dijital hizmetin anında ifasına onay veriyorum.
                </span>
              </label>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
                <PaymentBadges variant="checkout" size="sm" />
                <p className="flex items-center gap-1 text-xs text-[var(--ink-muted)]">
                  <Shield className="h-3.5 w-3.5 text-emerald-600" />
                  256-bit SSL güvenli ödeme
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
