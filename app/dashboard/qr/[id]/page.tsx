import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTenant, orgWhere } from "@/lib/tenant";
import { QrForm } from "@/components/qr/qr-form";
import { getEffectivePlanTier } from "@/lib/billing/pricing-config";
import { availableDurationTiers } from "@/lib/qr/duration";
import { getAppUrlFromRequest } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";

type Props = { params: Promise<{ id: string }> };

export default async function EditQrPage({ params }: Props) {
  const { organization } = await requireTenant();
  const { id } = await params;
  const qr = await prisma.qrCode.findFirst({ where: { id, ...orgWhere(organization.id) } });
  if (!qr) notFound();
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
    qr.mode as "STATIC" | "DYNAMIC",
  );

  return (
    <div className="space-y-6">
      <PageHeader title={qr.name} description="QR ayarlarını düzenleyin, süreyi uzatın ve baskı çıktısı alın" />
      {qr.shortCode ? (
        <Card>
          <CardBody className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Kısa link:</span>
            <code className="rounded-lg bg-violet-50 px-3 py-1.5 font-mono text-violet-800">
              {appUrl}/q/{qr.shortCode}
            </code>
          </CardBody>
        </Card>
      ) : null}
      <QrForm
        qrId={qr.id}
        shortCode={qr.shortCode}
        appUrl={appUrl}
        credits={organization.credits}
        unlimitedCredits={organization.unlimitedCredits}
        effectivePlan={effectivePlan}
        subscriptionStatus={organization.subscriptionStatus}
        trialEndsAt={organization.trialEndsAt?.toISOString() ?? null}
        durationTiers={durationTiers}
        initial={qr as unknown as Record<string, unknown>}
      />
    </div>
  );
}
