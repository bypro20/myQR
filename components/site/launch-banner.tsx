"use client";

import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { isLaunchActive, launchBannerText, LAUNCH } from "@/lib/marketing/launch-config";

const DISMISS_KEY = "myqr-launch-banner-dismiss";

export function LaunchBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLaunchActive()) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, []);

  if (!visible || !isLaunchActive()) return null;

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-violet-700 via-fuchsia-600 to-violet-700 text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      <div className="site-container relative flex items-center justify-between gap-3 py-2.5 pr-2">
        <p className="flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold sm:text-sm">
          <Sparkles className="hidden h-4 w-4 shrink-0 sm:block" />
          <span className="truncate sm:whitespace-normal">{launchBannerText()}</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/signup"
            className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-violet-700 shadow-sm hover:bg-white sm:px-4 sm:text-sm"
          >
            {LAUNCH.ctaPrimary}
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
