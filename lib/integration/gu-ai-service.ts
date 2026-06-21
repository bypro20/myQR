import { PlanTier, SubscriptionStatus } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createQrCode } from "@/lib/qr/service";
import { slugify } from "@/lib/utils";

export type GuAiProvisionInput = {
  externalId: string;
  companyName: string;
};

export async function findGuAiOrganization(externalId: string) {
  return prisma.organization.findFirst({
    where: { externalId },
  });
}

export async function provisionGuAiOrganization(input: GuAiProvisionInput) {
  const existing = await findGuAiOrganization(input.externalId);
  if (existing) return existing;

  const parentId = process.env.GU_AI_PARTNER_ORG_ID?.trim() || null;
  let slugBase = slugify(`guai-${input.externalId}`) || "guai-firma";
  let slug = slugBase;
  let i = 1;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${i++}`;
  }

  return prisma.organization.create({
    data: {
      name: input.companyName.trim(),
      slug,
      externalId: input.externalId,
      parentOrganizationId: parentId,
      planTier: PlanTier.PRO,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      credits: 0,
      unlimitedCredits: true,
    },
  });
}

function parsePhoneDigits(phone: string): { countryCode: string; phone: string } {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("90") && digits.length >= 12) {
    return { countryCode: "90", phone: digits.slice(2) };
  }
  if (digits.length >= 10) {
    return { countryCode: "90", phone: digits.slice(-10) };
  }
  return { countryCode: "90", phone: digits };
}

export async function createGuAiWhatsappQr(input: {
  externalId: string;
  companyName: string;
  phone: string;
  message?: string;
}) {
  const org = await provisionGuAiOrganization({
    externalId: input.externalId,
    companyName: input.companyName,
  });

  const existing = await prisma.qrCode.findFirst({
    where: {
      organizationId: org.id,
      type: "WHATSAPP",
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const { countryCode, phone } = parsePhoneDigits(input.phone);
  const message = input.message?.trim() || "Merhaba, bilgi almak istiyorum";

  if (existing) {
    let payload: { countryCode?: string; phone?: string; message?: string } = {};
    try {
      payload = JSON.parse(existing.payload || "{}") as typeof payload;
    } catch {
      payload = {};
    }
    const samePhone = `${payload.countryCode || ""}${payload.phone || ""}`.replace(/\D/g, "") === `${countryCode}${phone}`.replace(/\D/g, "");
    if (samePhone) {
      return { organizationId: org.id, qr: existing, created: false };
    }
  }

  const qr = await createQrCode(org.id, {
    name: `${input.companyName} — WhatsApp`,
    type: "WHATSAPP",
    mode: "STATIC",
    payload: { countryCode, phone, message },
    customerName: input.companyName,
    projectName: "GU AI",
    description: "GU AI tarafından otomatik oluşturuldu",
    design: {
      foregroundColor: "#111827",
      backgroundColor: "#ffffff",
      frameEnabled: true,
      frameStyle: "modern",
      showScanLabel: true,
      title: input.companyName,
      caption: "WhatsApp ile yazın",
    },
  });

  return { organizationId: org.id, qr, created: true };
}
