import { QrForm } from "@/components/qr/qr-form";
import { PageHeader } from "@/components/ui/page-header";
import { getEffectivePlanTier } from "@/lib/billing/pricing-config";
import { availableDurationTiers } from "@/lib/qr/duration";
import { requireTenant } from "@/lib/tenant";
import { getAppUrlFromRequest } from "@/lib/utils";

export default async function NewQrPage() {
  const { organization } = await requireTenant();
  const appUrl = await getAppUrlFromRequest();
  const effectivePlan = getEffectivePlanTier(organization);
  const durationTiers = availableDurationTiers(
    {
      planTier: organization.planTier,
      subscriptionStatus: organization.subscriptionStatus,
      trialEndsAt: organization.trialEndsAt,
      credits: organization.credits,
      unlimitedCredits: organization.unlimitedCredits,
    },
    "DYNAMIC",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yeni QR Oluştur"
        description="Süre seçin: 15 gün ücretsiz deneme veya kalıcı/aylık paket — süre bitince tarama durur"
      />
      <QrForm
        appUrl={appUrl}
        credits={organization.credits}
        unlimitedCredits={organization.unlimitedCredits}
        effectivePlan={effectivePlan}
        subscriptionStatus={organization.subscriptionStatus}
        trialEndsAt={organization.trialEndsAt?.toISOString() ?? null}
        durationTiers={durationTiers}
      />
    </div>
  );
}
