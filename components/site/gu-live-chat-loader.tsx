"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { GU_LIVECHAT_BASE, GU_LIVECHAT_VERSION, GU_LIVECHAT_WEBSITE_ID } from "@/components/site/gu-live-chat";

declare global {
  interface Window {
    $gu?: { (...args: unknown[]): void; q?: unknown[][] };
    GU_WIDGET_URL?: string;
  }
}

/** Widget yalnızca müşteri / pazarlama sayfalarında — admin ve dashboard hariç */
export function GuLiveChatLoader() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GU_LIVECHAT_WEBSITE_ID) return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) return;
    if (document.getElementById("gu-widget-loader-external")) return;

    window.$gu =
      window.$gu ||
      function (...args: unknown[]) {
        (window.$gu!.q = window.$gu!.q || []).push(args);
      };
    window.GU_WIDGET_URL = GU_LIVECHAT_BASE;
    window.$gu("set", "WEBSITE_ID", GU_LIVECHAT_WEBSITE_ID);

    const script = document.createElement("script");
    script.id = "gu-widget-loader-external";
    script.async = true;
    script.src = `${GU_LIVECHAT_BASE}/widget.js?v=${GU_LIVECHAT_VERSION}`;
    document.head.appendChild(script);
  }, [pathname]);

  return null;
}
