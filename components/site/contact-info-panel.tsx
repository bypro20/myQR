import Link from "next/link";
import { Mail, MapPin, Phone, Building2 } from "lucide-react";
import { formatCompanyAddress, getCompanyInfo } from "@/lib/company-info";

type Props = {
  variant?: "full" | "compact";
  showTitle?: boolean;
};

export function ContactInfoPanel({ variant = "full", showTitle = true }: Props) {
  const c = getCompanyInfo();
  const address = formatCompanyAddress(c);
  const isCompany = c.businessType === "company";

  return (
    <div
      className={
        variant === "full"
          ? "rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-8"
          : "space-y-4"
      }
    >
      {showTitle ? (
        <div>
          <h2 className="text-xl font-bold text-[var(--ink)]">İletişim</h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Mesafeli satış ve tüketici hakları için aşağıdaki bilgilere ulaşabilirsiniz.
          </p>
        </div>
      ) : null}

      <dl className={`grid gap-4 ${variant === "full" ? "mt-6 sm:grid-cols-2" : ""}`}>
        <div>
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
            <Building2 className="h-3.5 w-3.5" />
            {isCompany ? "Ticaret unvanı" : "Adı soyadı"}
          </dt>
          <dd className="mt-1 text-sm font-semibold text-[var(--ink)]">{c.legalName}</dd>
          {c.tradeName !== c.legalName ? (
            <dd className="mt-0.5 text-sm text-[var(--ink-muted)]">Marka: {c.tradeName}</dd>
          ) : null}
        </div>

        {isCompany && c.mersisNo ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              MERSİS numarası
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--ink)]">{c.mersisNo}</dd>
          </div>
        ) : null}

        {!isCompany && c.taxId ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Vergi kimlik numarası
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--ink)]">{c.taxId}</dd>
          </div>
        ) : null}

        {isCompany && c.taxId ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Vergi numarası
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--ink)]">{c.taxId}</dd>
          </div>
        ) : null}

        <div className={variant === "full" ? "sm:col-span-2" : ""}>
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
            <MapPin className="h-3.5 w-3.5" />
            Merkez adresi
          </dt>
          <dd className="mt-1 text-sm text-[var(--ink)]">{address}</dd>
        </div>

        {c.kep ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              KEP adresi
            </dt>
            <dd className="mt-1 text-sm text-[var(--ink)]">{c.kep}</dd>
          </div>
        ) : null}

        <div>
          <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
            <Mail className="h-3.5 w-3.5" />
            E-posta
          </dt>
          <dd className="mt-1">
            <a href={`mailto:${c.email}`} className="text-sm font-medium text-[var(--brand)] hover:underline">
              {c.email}
            </a>
          </dd>
        </div>

        {c.phone ? (
          <div>
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              <Phone className="h-3.5 w-3.5" />
              Telefon
            </dt>
            <dd className="mt-1">
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="text-sm font-medium text-[var(--brand)] hover:underline">
                {c.phone}
              </a>
            </dd>
          </div>
        ) : null}

        <div>
          <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
            Web sitesi
          </dt>
          <dd className="mt-1">
            <Link href="/" className="text-sm font-medium text-[var(--brand)] hover:underline">
              {c.website.replace(/^https?:\/\//, "")}
            </Link>
          </dd>
        </div>

        {c.chamber ? (
          <div className={variant === "full" ? "sm:col-span-2" : ""}>
            <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">
              Meslek odası
            </dt>
            <dd className="mt-1 text-sm text-[var(--ink)]">{c.chamber}</dd>
            {c.chamberRulesUrl ? (
              <dd className="mt-1">
                <a
                  href={c.chamberRulesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--brand)] hover:underline"
                >
                  Meslekle ilgili davranış kuralları
                </a>
              </dd>
            ) : null}
          </div>
        ) : null}
      </dl>
    </div>
  );
}
