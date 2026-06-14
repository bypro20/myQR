import Link from "next/link";
import { QrCode } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  stats?: { v: string; l: string }[];
  bullets?: string[];
  footer?: string;
};

export function AuthSidePanel({ title, subtitle, stats, bullets, footer }: Props) {
  return (
    <div className="page-hero relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="aurora">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
      </div>
      <div className="site-grid-bg absolute inset-0 opacity-[0.08]" />
      <div className="relative">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="logo-box h-10 w-10">
            <QrCode className="h-5 w-5" />
          </span>
          <span className="text-xl font-extrabold text-white">
            my<span className="text-gradient">QR</span>
          </span>
        </Link>
        <h1 className="mt-16 text-4xl font-extrabold leading-tight text-white">{title}</h1>
        <p className="mt-4 max-w-md text-lg text-slate-300/90">{subtitle}</p>
        {bullets ? (
          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            {bullets.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-400" />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {stats ? (
        <div className="relative flex flex-wrap gap-4">
          {stats.map((s) => (
            <div key={s.l} className="stat-pill">
              <p className="text-3xl font-extrabold text-gradient">{s.v}</p>
              <p className="text-sm text-slate-400">{s.l}</p>
            </div>
          ))}
        </div>
      ) : null}
      {footer ? <p className="relative text-sm text-slate-500">{footer}</p> : null}
    </div>
  );
}
