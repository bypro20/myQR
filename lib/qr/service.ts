import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { buildQrContent } from "@/lib/qr/generators";
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

export async function createQrCode(input: QrInput) {
  const shortCode = input.mode === "DYNAMIC" ? createShortCode() : null;
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

  const qr = await prisma.qrCode.create({
    data: {
      name: input.name,
      type: input.type as never,
      mode: input.mode,
      shortCode,
      targetUrl: input.targetUrl,
      payload: JSON.stringify(payload),
      design: JSON.stringify(input.design || {}),
      description: input.description,
      customerName: input.customerName,
      projectName: input.projectName,
      productType: input.productType,
      isActive: input.isActive ?? true,
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

  return qr;
}

export async function updateQrCode(id: string, input: Partial<QrInput>) {
  const existing = await prisma.qrCode.findUnique({ where: { id } });
  if (!existing) return null;

  const payload = input.payload
    ? { ...parseJson(existing.payload, {}), ...input.payload }
    : parseJson(existing.payload, {});

  const qr = await prisma.qrCode.update({
    where: { id },
    data: {
      name: input.name,
      targetUrl: input.targetUrl,
      payload: input.payload ? JSON.stringify(payload) : undefined,
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

export function getQrContent(qr: {
  type: string;
  mode: string;
  shortCode: string | null;
  targetUrl: string | null;
  payload: string;
}) {
  return buildQrContent({
    type: qr.type,
    mode: qr.mode as "STATIC" | "DYNAMIC",
    shortCode: qr.shortCode,
    targetUrl: qr.targetUrl,
    payload: parseJson(qr.payload, {}),
  });
}
