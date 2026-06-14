import { Suspense } from "react";
import { requireTenant } from "@/lib/tenant";
import { BillingPanel } from "@/components/billing/billing-panel";

type Props = {
  searchParams: Promise<{ payment?: string; msg?: string; tab?: string }>;
};

export default async function BillingPage({ searchParams }: Props) {
  const { organization } = await requireTenant();
  const sp = await searchParams;

  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Yükleniyor…</p>}>
      <BillingPanel
        organization={{
          id: organization.id,
          name: organization.name,
          planTier: organization.planTier,
          credits: organization.credits,
          subscriptionStatus: organization.subscriptionStatus,
          trialEndsAt: organization.trialEndsAt?.toISOString() ?? null,
        }}
        paymentNotice={sp.payment}
        paymentMessage={sp.msg}
      />
    </Suspense>
  );
}
