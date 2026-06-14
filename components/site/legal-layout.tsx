import Link from "next/link";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function LegalLayout({ title, description, children }: Props) {
  return (
    <div className="min-h-screen bg-[var(--surface-soft)]">
      <SiteHeader />
      <main className="site-container py-12 sm:py-16">
        <nav className="mb-8 text-sm text-[var(--ink-muted)]">
          <Link href="/" className="hover:text-[var(--ink)]">
            Ana Sayfa
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--ink)]">{title}</span>
        </nav>
        <span className="section-badge">Yasal</span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 text-base leading-relaxed text-[var(--ink-muted)]">{description}</p>
        ) : null}
        <article className="card-glow mt-10 space-y-6 p-8 text-[15px] leading-relaxed text-[var(--ink-muted)]">
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
