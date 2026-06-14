import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserRole } from "@/app/generated/prisma/client";
import { hashPassword, refreshSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdminPermissionApi } from "@/lib/tenant";

const patchSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  newPassword: z.string().min(8).max(128).optional(),
  role: z.enum([UserRole.CUSTOMER, UserRole.PARTNER]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminPermissionApi("users_manage");
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const body = patchSchema.parse(await req.json());
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    if (target.role === UserRole.SUPER_ADMIN || target.role === UserRole.PLATFORM_ADMIN) {
      return NextResponse.json({ error: "Admin hesapları buradan düzenlenemez. Yetkili Yönetimi sayfasını kullanın." }, { status: 400 });
    }

    if (body.role && auth.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Rol değişikliği yalnızca süper admin tarafından yapılabilir." }, { status: 403 });
    }

    if (body.isActive === false && target.id === auth.user.id) {
      return NextResponse.json({ error: "Kendi hesabınızı devre dışı bırakamazsınız." }, { status: 400 });
    }

    if (body.email) {
      const email = body.email.toLowerCase().trim();
      const taken = await prisma.user.findFirst({ where: { email, NOT: { id } } });
      if (taken) {
        return NextResponse.json({ error: "Bu e-posta kullanımda." }, { status: 409 });
      }
    }

    const data: Record<string, unknown> = {};
    if (body.name) data.name = body.name.trim();
    if (body.email) data.email = body.email.toLowerCase().trim();
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.newPassword) data.passwordHash = await hashPassword(body.newPassword);
    if (body.role) data.role = body.role;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (target.id === auth.user.id) {
      await refreshSession({ email: user.email, systemRole: user.role });
    }

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz form verisi." }, { status: 400 });
    }
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminPermissionApi("users_manage");
  if (auth.error) return auth.error;

  const { id } = await params;

  if (id === auth.user.id) {
    return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
  }

  if (target.role === UserRole.SUPER_ADMIN || target.role === UserRole.PLATFORM_ADMIN) {
    return NextResponse.json({ error: "Admin hesapları buradan silinemez." }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
