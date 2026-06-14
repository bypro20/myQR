"use client";

import Link from "next/link";
import { ArrowRight, Rocket, X } from "lucide-react";
import { useEffect, useState } from "react";
import { isLaunchActive, signupOfferLine } from "@/lib/marketing/launch-config";

const DISMISS_KEY = "myqr-dashboard-onboarding-dismiss";

type Props = {
  qrCount: number;
  credits: number;
};

export function OnboardingBanner({ qrCount, credits }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (qrCount > 0) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, [qrCount]);

  if (!visible || qrCount > 0) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-violet-50 p-5 shadow-md">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-violet-400 hover:bg-white/60 hover:text-violet-700"
        aria-label="Kapat"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex flex-col gap-4 pr-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg">
            <Rocket className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-violet-950">
              {isLaunchActive() ? "Lansmana hoş geldiniz!" : "myQR'a hoş geldiniz!"}
            </p>
            <p className="mt-1 text-sm text-violet-800/80">{signupOfferLine()}</p>
            <p className="mt-1 text-xs text-violet-600/80">
              Bakiye: {credits} kredi · İlk adım: dinamik QR oluşturun ve test edin.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/qr/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-300/40 hover:opacity-95"
        >
          İlk QR&apos;ımı oluştur <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
