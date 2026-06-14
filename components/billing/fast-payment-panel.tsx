"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, Copy, Landmark, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  order: {
    id: string;
    amountTry: number;
    credits: number;
    packageName: string;
    referenceCode: string;
    status: string;
  };
  bank: {
    iban: string;
    accountName: string;
    bankName: string;
  };
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

export function FastPaymentPanel({ order, bank }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "info">("info");
  const awaiting = order.status === "AWAITING_CONFIRMATION";
  const completed = order.status === "COMPLETED";

  async function claimPaid() {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/billing/fast/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    const data = await res.json();
    setLoading(false);
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

      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-md">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <Landmark className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">FAST · Tüm bankalar</p>
            <h1 className="mt-1 text-2xl font-bold text-[var(--ink)]">Havale / FAST ile öde</h1>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              {order.packageName} · {order.credits.toLocaleString("tr-TR")} kredi ·{" "}
              <strong>{order.amountTry.toLocaleString("tr-TR")} ₺</strong>
            </p>
          </div>
        </div>
      </div>

      {message && (
        <p
          className={cn(
            "rounded-xl border px-4 py-3 text-sm font-medium",
            messageTone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-900",
          )}
        >
          {message}
        </p>
      )}

      {completed ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          Ödeme onaylandı, krediler hesabınıza yüklendi.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              <CopyField label="IBAN" value={bank.iban} />
              <CopyField label="Alıcı adı" value={bank.accountName} />
              <CopyField label="Tutar" value={`${order.amountTry.toLocaleString("tr-TR")} TL`} />
              <CopyField label="Açıklama (zorunlu)" value={order.referenceCode} />
              <p className="text-xs leading-relaxed text-[var(--ink-muted)]">
                Mobil bankacılık uygulamanızdan <strong>FAST / Havale</strong> ile gönderin. Açıklama alanına referans
                kodunu aynen yazın; banka fark etmez (Ziraat, İş, Akbank, Yapı Kredi, Garanti, QNB vb.).
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm">
              <QrCode className="mb-2 h-5 w-5 text-amber-700" />
              <p className="text-xs font-bold text-amber-900">TR Karekod (FAST)</p>
              <p className="mt-1 max-w-[14rem] text-center text-[11px] leading-relaxed text-amber-800">
                Bu QR bir web linki değildir; kamera uygulaması açmaz.{" "}
                <strong>Banka uygulamanızın</strong> içinden okutun.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/billing/fast/qr/${order.id}`}
                alt="FAST ödeme QR kodu"
                width={200}
                height={200}
                className="mt-3 rounded-lg border border-white bg-white p-2"
              />
              <ol className="mt-3 max-w-[14rem] space-y-1 text-left text-[10px] leading-relaxed text-amber-900">
                <li>Enpara: <strong>Para Gönder → Karekod ile Öde</strong></li>
                <li>Diğer bankalar: <strong>TR Karekod / QR ile transfer</strong></li>
                <li>IBAN ve tutar otomatik dolar — siyah-beyaz QR</li>
                <li>Açıklamaya <strong>{order.referenceCode}</strong> yazmayı unutmayın</li>
              </ol>
              <p className="mt-2 text-[10px] text-amber-700/90">
                QR çalışmazsa soldaki IBAN ile manuel FAST yapın.
              </p>
            </div>
          </div>

          {!awaiting ? (
            <button
              type="button"
              onClick={claimPaid}
              disabled={loading}
              className="btn-gradient w-full py-3.5 text-sm disabled:opacity-60"
            >
              {loading ? "Gönderiliyor…" : "Ödemeyi yaptım — bildir"}
            </button>
          ) : (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 text-sm text-violet-900">
              Ödeme bildiriminiz alındı. Transfer banka hesabımızda doğrulandığında krediler otomatik yüklenecek
              (genelde birkaç dakika — mesai saatlerinde).
            </div>
          )}
        </>
      )}
    </div>
  );
}
