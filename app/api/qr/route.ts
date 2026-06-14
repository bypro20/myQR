import { NextRequest, NextResponse } from "next/server";
import { ActivityKind } from "@/app/generated/prisma/client";
import { logActivity } from "@/lib/admin/activity-log";
import { requireTenantApi } from "@/lib/auth-api";
import { orgWhere } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { createQrCode } from "@/lib/qr/service";
import { handleQrWriteError } from "@/lib/qr/api-errors";

export async function GET(req: NextRequest) {
  const auth = await requireTenantApi();
  if (auth.error) return auth.error;

  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type");
  const mode = searchParams.get("mode");
  const page = Number(searchParams.get("page") || "1");
  const limit = 20;

  const where = {
    ...orgWhere(auth.organization.id),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { customerName: { contains: q } },
            { projectName: { contains: q } },
            { shortCode: { contains: q } },
          ],
        }
      : {}),
    ...(type ? { type: type as never } : {}),
    ...(mode ? { mode: mode as never } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.qrCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.qrCode.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const auth = await requireTenantApi();
  if (auth.error) return auth.error;

  try {
    const qr = await createQrCode(auth.organization.id, await req.json());
    void logActivity({
      kind: ActivityKind.QR_CREATED,
      actorUserId: auth.user.id,
      organizationId: auth.organization.id,
      targetType: "qr",
      targetId: qr.id,
      targetLabel: qr.name,
      message: `${auth.user.name} · "${qr.name}" (${qr.type}, ${qr.mode}) QR kodu oluşturdu`,
      metadata: { qrType: qr.type, mode: qr.mode },
    });
    return NextResponse.json(qr, { status: 201 });
  } catch (err) {
    return handleQrWriteError(err);
  }
}
