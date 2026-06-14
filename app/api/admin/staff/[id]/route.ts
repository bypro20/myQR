import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@/app/generated/prisma/client";
import {
  AdminPermissionKey,
  ALL_ADMIN_PERMISSIONS,
  serializeAdminPermissions,
} from "@/lib/admin-permissions";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminApi } from "@/lib/tenant";

const patchSchema = z.object({
  permissions: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdminApi();
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const body = patchSchema.parse(await req.json());
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.role !== UserRole.PLATFORM_ADMIN) {
      return NextResponse.json({ error: "Yetkili kullanıcı bulunamadı." }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.permissions) {
      const permissions = body.permissions.filter((p): p is AdminPermissionKey =>
        ALL_ADMIN_PERMISSIONS.includes(p as AdminPermissionKey),
      );
      if (permissions.length === 0) {
        return NextResponse.json({ error: "En az bir yetki seçmelisiniz." }, { status: 400 });
      }
      data.adminPermissions = serializeAdminPermissions(permissions);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        adminPermissions: true,
        isActive: true,
        grantedAt: true,
      },
    });

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz form verisi." }, { status: 400 });
    }
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdminApi();
  if (auth.error) return auth.error;

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role !== UserRole.PLATFORM_ADMIN) {
    return NextResponse.json({ error: "Yetkili kullanıcı bulunamadı." }, { status: 404 });
  }

  await prisma.user.update({
    where: { id },
    data: {
      role: UserRole.CUSTOMER,
      adminPermissions: "[]",
      grantedById: null,
      grantedAt: null,
    },
  });

  return NextResponse.json({ ok: true });
}
