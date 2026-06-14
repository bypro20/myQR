"use client";

import { useEffect, useRef, useState } from "react";
import { isTurnstileSiteKeyConfigured } from "@/lib/security/turnstile";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void; "expired-callback"?: () => void },
      ) => string;
      remove: (id: string) => void;
    };
  }
}

type Props = {
  onToken: (token: string) => void;
  onExpire?: () => void;
};

export function TurnstileWidget({ onToken, onExpire }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [enabled] = useState(() => isTurnstileSiteKeyConfigured());
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!enabled || !siteKey || !ref.current) return;

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      if (!ref.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: onToken,
        "expired-callback": onExpire,
      });
    };
    document.head.appendChild(script);

    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
      }
      script.remove();
    };
  }, [enabled, siteKey, onToken, onExpire]);

  if (!enabled) return null;
  return <div ref={ref} className="mt-4 flex justify-center" />;
}
