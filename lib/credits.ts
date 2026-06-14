import { CreditTxType } from "@/app/generated/prisma/client";
import { getEffectivePlanTier } from "@/lib/billing/pricing-config";
import { prisma } from "@/lib/prisma";
import { CREDIT_COSTS, getPlan, planAllows, type PlanTier as PlanTierName } from "@/lib/plans";

/** Görüntüleme ve sınırsız mod için referans bakiye */
export const UNLIMITED_CREDITS_BALANCE = 9_999_999_999;

export async function isOrganizationUnlimited(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { unlimitedCredits: true },
  });
  return org?.unlimitedCredits === true;
}

export async function getOrganizationBalance(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      credits: true,
      unlimitedCredits: true,
      planTier: true,
      qrCount: true,
      subscriptionStatus: true,
      trialEndsAt: true,
    },
  });
  if (!org) throw new Error("Organizasyon bulunamadı");
  return org;
}

export async function addCredits(
  organizationId: string,
  amount: number,
  type: CreditTxType,
  description: string,
  referenceId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const org = await tx.organization.update({
      where: { id: organizationId },
      data: { credits: { increment: amount } },
    });
    await tx.creditTransaction.create({
      data: {
        organizationId,
        type,
        amount,
        balanceAfter: org.credits,
        description,
        referenceId,
      },
    });
    return org;
  });
}

export async function adminAdjustCredits(organizationId: string, amount: number, description: string) {
  if (amount === 0) {
    return prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
  }
  if (amount > 0) {
    return addCredits(organizationId, amount, CreditTxType.ADMIN, description);
  }

  return prisma.$transaction(async (tx) => {
    const current = await tx.organization.findUniqueOrThrow({ where: { id: organizationId } });
    if (current.unlimitedCredits) {
      return current;
    }
    const deduct = Math.min(current.credits, Math.abs(amount));
    const org = await tx.organization.update({
      where: { id: organizationId },
      data: { credits: { decrement: deduct } },
    });
    await tx.creditTransaction.create({
      data: {
        organizationId,
        type: CreditTxType.ADMIN,
        amount: -deduct,
        balanceAfter: org.credits,
        description,
      },
    });
    return org;
  });
}

export async function adminSetCredits(organizationId: string, credits: number, description: string) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.organization.findUniqueOrThrow({ where: { id: organizationId } });
    const next = Math.max(0, Math.floor(credits));
    const org = await tx.organization.update({
      where: { id: organizationId },
      data: { credits: next, unlimitedCredits: false },
    });
    await tx.creditTransaction.create({
      data: {
        organizationId,
        type: CreditTxType.ADMIN,
        amount: next - current.credits,
        balanceAfter: org.credits,
        description,
      },
    });
    return org;
  });
}

export async function adminSetUnlimitedCredits(organizationId: string, enabled: boolean, description?: string) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.organization.findUniqueOrThrow({ where: { id: organizationId } });
    const org = await tx.organization.update({
      where: { id: organizationId },
      data: enabled
        ? {
            unlimitedCredits: true,
            credits: UNLIMITED_CREDITS_BALANCE,
            planTier: "BUSINESS",
            subscriptionStatus: "ACTIVE",
          }
        : {
            unlimitedCredits: false,
            credits: current.credits >= UNLIMITED_CREDITS_BALANCE ? 10_000 : current.credits,
          },
    });
    await tx.creditTransaction.create({
      data: {
        organizationId,
        type: CreditTxType.ADMIN,
        amount: enabled ? UNLIMITED_CREDITS_BALANCE - current.credits : 0,
        balanceAfter: org.credits,
        description: description || (enabled ? "Sınırsız kredi aktif edildi" : "Sınırsız kredi kapatıldı"),
      },
    });
    return org;
  });
}

export async function transferCredits(
  fromOrganizationId: string,
  toOrganizationId: string,
  amount: number,
  description: string,
  referenceId?: string,
) {
  if (amount <= 0) throw new Error("INVALID_AMOUNT");

  return prisma.$transaction(async (tx) => {
    const from = await tx.organization.findUniqueOrThrow({ where: { id: fromOrganizationId } });

    if (!from.unlimitedCredits) {
      if (from.credits < amount) throw new Error("INSUFFICIENT_CREDITS");
      const fromUpdated = await tx.organization.update({
        where: { id: fromOrganizationId },
        data: { credits: { decrement: amount } },
      });
      await tx.creditTransaction.create({
        data: {
          organizationId: fromOrganizationId,
          type: CreditTxType.TRANSFER,
          amount: -amount,
          balanceAfter: fromUpdated.credits,
          description: `Müşteriye aktarım: ${description}`,
          referenceId,
        },
      });
    }

    const toUpdated = await tx.organization.update({
      where: { id: toOrganizationId },
      data: { credits: { increment: amount } },
    });
    await tx.creditTransaction.create({
      data: {
        organizationId: toOrganizationId,
        type: CreditTxType.TRANSFER,
        amount,
        balanceAfter: toUpdated.credits,
        description,
        referenceId,
      },
    });

    return toUpdated;
  });
}

export async function spendCredits(
  organizationId: string,
  amount: number,
  description: string,
  referenceId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.organization.findUniqueOrThrow({ where: { id: organizationId } });
    if (current.unlimitedCredits) {
      return current;
    }
    if (current.credits < amount) {
      throw new Error("INSUFFICIENT_CREDITS");
    }
    const org = await tx.organization.update({
      where: { id: organizationId },
      data: { credits: { decrement: amount } },
    });
    await tx.creditTransaction.create({
      data: {
        organizationId,
        type: CreditTxType.SPEND,
        amount: -amount,
        balanceAfter: org.credits,
        description,
        referenceId,
      },
    });
    return org;
  });
}

export async function assertCanCreateQr(organizationId: string, mode: "STATIC" | "DYNAMIC") {
  const org = await getOrganizationBalance(organizationId);
  const effectiveTier = getEffectivePlanTier(org);
  const plan = getPlan(effectiveTier);
  const cost = mode === "DYNAMIC" ? CREDIT_COSTS.DYNAMIC_QR : CREDIT_COSTS.STATIC_QR;

  if (!org.unlimitedCredits && plan.qrLimit !== null && org.qrCount >= plan.qrLimit) {
    throw new Error("QR_LIMIT_REACHED");
  }
  if (mode === "DYNAMIC" && !org.unlimitedCredits && !planAllows(effectiveTier, "dynamicQr")) {
    throw new Error("PLAN_NO_DYNAMIC");
  }
  if (!org.unlimitedCredits && org.credits < cost) {
    throw new Error("INSUFFICIENT_CREDITS");
  }
  return cost;
}

export async function chargeQrCreation(organizationId: string, mode: "STATIC" | "DYNAMIC", qrId: string) {
  const cost = await assertCanCreateQr(organizationId, mode);
  await prisma.$transaction(async (tx) => {
    await tx.organization.update({
      where: { id: organizationId },
      data: { qrCount: { increment: 1 } },
    });
  });
  await spendCredits(
    organizationId,
    cost,
    mode === "DYNAMIC" ? "Dinamik QR oluşturma" : "Statik QR oluşturma",
    qrId,
  );
}