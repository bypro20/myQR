import { nanoid } from "nanoid";
import { CreditTxType, QrDurationTier } from "@/app/generated/prisma/client";
import { getEffectivePlanTier } from "@/lib/billing/pricing-config";
import {
  availableDurationTiers,
  computeExpiresAt,
  defaultDurationTier,
  extendExpiresAt,
  getDurationTier,
  qrRenewalCost,
  qrTotalCreationCost,
  tierExtraCredits,
} from "@/lib/qr/duration";
import { prisma } from "@/lib/prisma";
import { isStaticOnlyType } from "@/lib/qr/catalog";
import { buildQrContent } from "@/lib/qr/generators";
import { resolveStoredTarget } from "@/lib/qr/normalize";
import { assertQrInputValid } from "@/lib/qr/validate-input";
import { getPlan, planAllows, type PlanTier } from "@/lib/plans";
import { parseJson, slugify } from "@/lib/utils";

export function createShortCode() {
  return nanoid(8);
}

export type QrInput = {
  name: string;
  type: string;
  mode: "STATIC" | "DYNAMIC";
  targetUrl?: string;
  payload?: Record<string, unknown>;
  design?: Record<string, unknown>;
  description?: string;
  customerName?: string;
  projectName?: string;
  productType?: string;
  isActive?: boolean;
  templateId?: string;
  durationTier?: QrDurationTier;
  linkBio?: {
    title: string;
    description?: string;
    bgColor?: string;
    buttonColor?: string;
    links?: Array<{ label: string; url: string; type?: string }>;
  };
  warranty?: { title?: string };
  lcv?: { eventName: string; eventDate?: string; title?: string };
};

function assertPlanForQrType(planTier: PlanTier, type: string, unlimited: boolean) {
  if (unlimited) return;
  if ((type === "WARRANTY" || type === "LCV") && !planAllows(planTier, "warrantyLcv")) {
    throw new Error("PLAN_NO_WARRANTY_LCV");
  }
}

function assertCanCreateQrTx(
  org: { credits: number; qrCount: number; planTier: string; unlimitedCredits: boolean; subscriptionStatus: string; trialEndsAt: Date | null },
  mode: "STATIC" | "DYNAMIC",
  effectiveTier: PlanTier,
  totalCost: number,
) {
  const plan = getPlan(effectiveTier);

  if (!org.unlimitedCredits && plan.qrLimit !== null && org.qrCount >= plan.qrLimit) {
    throw new Error("QR_LIMIT_REACHED");
  }
  if (mode === "DYNAMIC" && !org.unlimitedCredits && !planAllows(effectiveTier, "dynamicQr")) {
    throw new Error("PLAN_NO_DYNAMIC");
  }
  if (!org.unlimitedCredits && org.credits < totalCost) {
    throw new Error("INSUFFICIENT_CREDITS");
  }
  return totalCost;
}

function resolveDurationTier(
  input: QrInput,
  org: { credits: number; planTier: string; unlimitedCredits: boolean; subscriptionStatus: string; trialEndsAt: Date | null },
  mode: "STATIC" | "DYNAMIC",
): QrDurationTier {
  const tier = (input.durationTier || defaultDurationTier(org)) as QrDurationTier;
  if (!getDurationTier(tier)) throw new Error("INVALID_DURATION_TIER");

  const allowed = availableDurationTiers(org, mode);
  if (!allowed.some((t) => t.id === tier)) throw new Error("DURATION_TIER_NOT_ALLOWED");

  return tier;
}

export async function createQrCode(organizationId: string, input: QrInput) {
  const mode = isStaticOnlyType(input.type) ? "STATIC" : input.mode;

  assertQrInputValid({
    name: input.name,
    type: input.type,
    mode,
    payload: input.payload,
    targetUrl: input.targetUrl,
    shortCode: mode === "DYNAMIC" ? "pending" : null,
  });

  const shortCode = mode === "DYNAMIC" ? createShortCode() : null;
  const payload = { ...(input.payload || {}) };

  if (input.type === "LINK_BIO") {
    payload.slug = payload.slug || slugify(input.linkBio?.title || input.name) || shortCode;
  }
  if (input.type === "WARRANTY") {
    payload.slug = payload.slug || slugify(input.name) || shortCode;
  }
  if (input.type === "LCV") {
    payload.slug = payload.slug || slugify(input.lcv?.eventName || input.name) || shortCode;
  }

  const { payload: normalizedPayload, targetUrl } = resolveStoredTarget(
    input.type,
    mode,
    payload,
    input.targetUrl,
    shortCode,
  );

  return prisma.$transaction(async (tx) => {
    const org = await tx.organization.findUniqueOrThrow({ where: { id: organizationId } });
    const effectiveTier = getEffectivePlanTier(org);
    assertPlanForQrType(effectiveTier, input.type, org.unlimitedCredits);
    const durationTier = resolveDurationTier(input, org, mode);
    const totalCost = qrTotalCreationCost(mode, durationTier, org);
    const cost = assertCanCreateQrTx(org, mode, effectiveTier, totalCost);
    const expiresAt = computeExpiresAt(durationTier);
    const tierDef = getDurationTier(durationTier)!;

    const qr = await tx.qrCode.create({
      data: {
        organizationId,
        name: input.name,
        type: input.type as never,
        mode,
        shortCode,
        targetUrl,
        payload: JSON.stringify(normalizedPayload),
        design: JSON.stringify(input.design || {}),
        description: input.description,
        customerName: input.customerName,
        projectName: input.projectName,
        productType: input.productType,
        isActive: input.isActive ?? true,
        durationTier,
        expiresAt,
        templateId: input.templateId || undefined,
        linkBio:
          input.type === "LINK_BIO"
            ? {
                create: {
                  slug: String(payload.slug),
                  title: input.linkBio?.title || input.name,
                  description: input.linkBio?.description,
                  bgColor: input.linkBio?.bgColor || "#ffffff",
                  buttonColor: input.linkBio?.buttonColor || "#111827",
                  links: JSON.stringify(input.linkBio?.links || []),
                },
              }
            : undefined,
        warrantyForm:
          input.type === "WARRANTY"
            ? {
                create: {
                  slug: String(payload.slug),
                  title: input.warranty?.title || "Garanti Aktivasyon",
                },
              }
            : undefined,
        lcvForm:
          input.type === "LCV"
            ? {
                create: {
                  slug: String(payload.slug),
                  eventName: input.lcv?.eventName || input.name,
                  eventDate: input.lcv?.eventDate,
                  title: input.lcv?.title || "Katılım Formu",
                },
              }
            : undefined,
      },
      include: { linkBio: true, warrantyForm: true, lcvForm: true },
    });

    if (org.unlimitedCredits) {
      await tx.organization.update({
        where: { id: organizationId },
        data: { qrCount: { increment: 1 } },
      });
    } else {
      const updated = await tx.organization.update({
        where: { id: organizationId },
        data: { qrCount: { increment: 1 }, credits: { decrement: cost } },
      });
      await tx.creditTransaction.create({
        data: {
          organizationId,
          type: CreditTxType.SPEND,
          amount: -cost,
          balanceAfter: updated.credits,
          description: mode === "DYNAMIC" ? `Dinamik QR (${tierDef.shortLabel})` : `Statik QR (${tierDef.shortLabel})`,
          referenceId: qr.id,
        },
      });
    }

    return qr;
  });
}

export async function updateQrCode(organizationId: string, id: string, input: Partial<QrInput>) {
  const existing = await prisma.qrCode.findFirst({ where: { id, organizationId } });
  if (!existing) return null;

  const payload = input.payload
    ? { ...parseJson<Record<string, unknown>>(existing.payload, {}), ...input.payload }
    : parseJson<Record<string, unknown>>(existing.payload, {});

  assertQrInputValid({
    name: input.name ?? existing.name,
    type: existing.type,
    mode: existing.mode as "STATIC" | "DYNAMIC",
    payload,
    targetUrl: input.targetUrl ?? existing.targetUrl,
    shortCode: existing.shortCode,
  });

  const { payload: normalizedPayload, targetUrl } = resolveStoredTarget(
    existing.type,
    existing.mode as "STATIC" | "DYNAMIC",
    payload,
    input.targetUrl ?? existing.targetUrl,
    existing.shortCode,
  );

  const qr = await prisma.qrCode.update({
    where: { id },
    data: {
      name: input.name,
      targetUrl,
      payload: JSON.stringify(normalizedPayload),
      design: input.design ? JSON.stringify(input.design) : undefined,
      description: input.description,
      customerName: input.customerName,
      projectName: input.projectName,
      productType: input.productType,
      isActive: input.isActive,
      templateId: input.templateId,
    },
  });

  if (input.linkBio && existing.type === "LINK_BIO") {
    await prisma.linkBioPage.updateMany({
      where: { qrCodeId: id },
      data: {
        title: input.linkBio.title,
        description: input.linkBio.description,
        bgColor: input.linkBio.bgColor,
        buttonColor: input.linkBio.buttonColor,
        links: JSON.stringify(input.linkBio.links || []),
      },
    });
  }

  return qr;
}

export async function renewQrDuration(
  organizationId: string,
  qrId: string,
  durationTier: QrDurationTier,
) {
  if (!getDurationTier(durationTier)) throw new Error("INVALID_DURATION_TIER");

  return prisma.$transaction(async (tx) => {
    const qr = await tx.qrCode.findFirst({ where: { id: qrId, organizationId } });
    if (!qr) throw new Error("QR_NOT_FOUND");

    const org = await tx.organization.findUniqueOrThrow({ where: { id: organizationId } });
    const mode = qr.mode as "STATIC" | "DYNAMIC";
    const allowed = availableDurationTiers(org, mode);
    if (!allowed.some((t) => t.id === durationTier)) throw new Error("DURATION_TIER_NOT_ALLOWED");

    const renewCost = qrRenewalCost(mode, durationTier, org);
    if (!org.unlimitedCredits && org.credits < renewCost) throw new Error("INSUFFICIENT_CREDITS");

    const expiresAt = extendExpiresAt(durationTier, qr.expiresAt);
    const tierDef = getDurationTier(durationTier)!;

    const updated = await tx.qrCode.update({
      where: { id: qrId },
      data: {
        durationTier,
        expiresAt,
        isActive: true,
      },
    });

    if (!org.unlimitedCredits) {
      const orgUpdated = await tx.organization.update({
        where: { id: organizationId },
        data: { credits: { decrement: renewCost } },
      });
      await tx.creditTransaction.create({
        data: {
          organizationId,
          type: CreditTxType.SPEND,
          amount: -renewCost,
          balanceAfter: orgUpdated.credits,
          description: `QR süre uzatma: ${qr.name} (${tierDef.shortLabel})`,
          referenceId: qr.id,
        },
      });
    }

    return updated;
  });
}

export function getQrContent(
  qr: {
    type: string;
    mode: string;
    shortCode: string | null;
    targetUrl: string | null;
    payload: string;
  },
  baseUrl?: string,
) {
  return buildQrContent({
    type: qr.type,
    mode: qr.mode as "STATIC" | "DYNAMIC",
    shortCode: qr.shortCode,
    targetUrl: qr.targetUrl,
    payload: parseJson(qr.payload, {}),
    baseUrl,
  });
}
