"use client";

import { Suspense } from "react";
import { PricingStorefront } from "@/components/site/pricing-storefront";

function PricingFallback() {
  return (
    <div className="site-container py-20 text-center text-sm text-[var(--ink-muted)]">
      Fiyatlandırma yükleniyor…
    </div>
  );
}

export function PricingPageClient() {
  return (
    <Suspense fallback={<PricingFallback />}>
      <PricingStorefront />
    </Suspense>
  );
}
