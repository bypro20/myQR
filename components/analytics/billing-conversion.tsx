"use client";

import { useEffect, useRef } from "react";
import { trackPurchaseConversion } from "@/lib/analytics/gtag";

type Props = {
  paymentNotice?: string;
  /** Ödeme tutarı TRY — URL veya siparişten */
  valueTry?: number;
};

export function BillingConversion({ paymentNotice, valueTry }: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || paymentNotice !== "success") return;
    fired.current = true;
    trackPurchaseConversion(valueTry);
  }, [paymentNotice, valueTry]);

  return null;
}
