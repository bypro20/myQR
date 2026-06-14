"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Mail,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import {
  PARTNER_EMAIL,
  buildWhatsAppUrl,
  formatWhatsAppDisplay,
} from "@/lib/site-contact";
import { cn } from "@/lib/utils";

const businessTypes = [
  "Matbaa / baskı merkezi",
  "Reklam / dijital ajans",
  "Yazılım / entegratör",
  "Perakende / franchise",
  "Diğer",
];

const volumeOptions = [
  "Başlangıç — ayda ~100–500 kredi",
  "Orta — ayda ~500–2.000 kredi",
  "Yüksek — ayda 2.000+ kredi",
  "Henüz emin değilim",
];

type FormState = {
  name: string;
  company: string;
  phone: string;
  email: string;
  businessType: string;
  volume: string;
  message: string;
};

const empty: FormState = {
  name: "",
  company: "",
  phone: "",
  email: "",
  businessType: businessTypes[0],
  volume: volumeOptions[3],
  message: "",
};

function buildApplicationMessage(data: FormState) {
  return [
    "Merhaba, myQR panel kiralama / iş ortağı başvurusu yapmak istiyorum.",
    "",
    `Ad Soyad: ${data.name}`,
    `Şirket / İşletme: ${data.company}`,
    `Telefon: ${data.phone}`,
    `E-posta: ${data.email}`,
    `İş alanı: ${data.businessType}`,
    `Tahmini aylık hacim: ${data.volume}`,
    data.message ? `Not: ${data.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function PartnerInquiryForm() {
  const [form, setForm] = useState<FormState>(empty);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  function validate() {
    if (!form.name.trim()) return "Ad soyad girin.";
    if (!form.company.trim()) return "Şirket / işletme adı girin.";
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) return "Geçerli telefon girin.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Geçerli e-posta girin.";
    return "";
  }

  function submitViaWhatsApp() {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    const url = buildWhatsAppUrl(buildApplicationMessage(form));
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  }

  const inputClass =
    "input-focus w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm text-[var(--ink)]";

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h3 className="mt-4 text-xl font-bold text-emerald-950">WhatsApp&apos;a yönlendirildiniz</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-emerald-900/80">
          Başvuru bilgileriniz WhatsApp mesajına hazırlandı. Gönder butonuna basarak talebinizi iletebilirsiniz.
          Ekibimiz en kısa sürede dönüş yapacaktır.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={submitViaWhatsApp}
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#20bd5a]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp&apos;ı tekrar aç
          </button>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setForm(empty);
            }}
            className="btn-outline px-5 py-2.5 text-sm"
          >
            Yeni başvuru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-lg sm:p-8">
        <h3 className="text-xl font-bold text-[var(--ink)]">İş ortağı başvuru formu</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
          Bilgilerinizi doldurun; WhatsApp üzerinden doğrudan satış ekibimize iletin. İndirimli toptan kredi
          teklifi ve panel açılış süreci hakkında size özel dönüş yapılır.
        </p>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Ad Soyad *
            </label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Adınız Soyadınız"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Şirket / İşletme *
            </label>
            <input
              className={inputClass}
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              placeholder="Firma adı"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Telefon *
            </label>
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="05XX XXX XX XX"
              type="tel"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              E-posta *
            </label>
            <input
              className={inputClass}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="ornek@sirket.com"
              type="email"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              İş alanı
            </label>
            <select
              className={inputClass}
              value={form.businessType}
              onChange={(e) => update("businessType", e.target.value)}
            >
              {businessTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Tahmini aylık hacim
            </label>
            <select
              className={inputClass}
              value={form.volume}
              onChange={(e) => update("volume", e.target.value)}
            >
              {volumeOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Ek not (isteğe bağlı)
            </label>
            <textarea
              className={cn(inputClass, "min-h-[88px] resize-y")}
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="Kaç müşteriye panel açmayı planlıyorsunuz, özel ihtiyaçlarınız..."
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={submitViaWhatsApp}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-200/50 transition hover:bg-[#20bd5a] sm:flex-none"
          >
            <Send className="h-4 w-4" />
            WhatsApp ile başvur
          </button>
          <Link href="/signup" className="btn-gradient inline-flex items-center gap-2 px-6 py-3.5 text-sm">
            Önce hesap aç <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-[var(--ink-muted)]">
          Başvuru sonrası indirimli toptan kredi teklifi paylaşılır. Ödeme: kart, FAST/havale veya fatura
          talebi — detaylar onay sonrası iletilir.
        </p>
      </div>

      <aside className="space-y-4">
        <ContactCard
          icon={MessageCircle}
          title="WhatsApp"
          highlight
          href={buildWhatsAppUrl("Merhaba, panel kiralama hakkında bilgi almak istiyorum.")}
          value={formatWhatsAppDisplay()}
          sub="En hızlı yanıt — doğrudan satış ekibi"
        />
        <ContactCard
          icon={Phone}
          title="Telefon"
          href="tel:+905051236824"
          value={formatWhatsAppDisplay()}
          sub="Hafta içi 09:00 – 18:00"
        />
        <ContactCard
          icon={Mail}
          title="E-posta"
          href={`mailto:${PARTNER_EMAIL}`}
          value={PARTNER_EMAIL}
          sub="Teklif ve sözleşme talepleri"
        />
        <ContactCard
          icon={Building2}
          title="Süreç"
          value="1–2 iş günü"
          sub="Başvuru → teklif → kredi yükleme → panel açılışı"
        />
      </aside>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  title,
  value,
  sub,
  href,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  sub: string;
  href?: string;
  highlight?: boolean;
}) {
  const inner = (
    <>
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white",
          highlight ? "bg-[#25D366]" : "bg-gradient-to-br from-violet-500 to-blue-600",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">{title}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-[var(--ink)]">{value}</p>
        <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{sub}</p>
      </div>
    </>
  );

  const className =
    "flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm transition hover:shadow-md";

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}
