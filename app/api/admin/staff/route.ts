import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { MembershipRole, UserRole } from "@/app/generated/prisma/client";
import {
  AdminPermissionKey,
  ALL_ADMIN_PERMISSIONS,
  serializeAdminPermissions,
} from "@/lib/admin-permissions";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireSuperAdminApi } from "@/lib/tenant";

const grantSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(128).optional(),
  permissions: z.array(z.string()).min(1),
});

export async function GET() {
  const auth = await requireSuperAdminApi();
  if (auth.error) return auth.error;

  const [staff, candidates] = await Promise.all([
    prisma.user.findMany({
      where: { role: UserRole.PLATFORM_ADMIN },
      orderBy: { grantedAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        adminPermissions: true,
        grantedAt: true,
        isActive: true,
        lastLoginAt: true,
        grantedBy: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: UserRole.CUSTOMER, isActive: true },
      orderBy: { name: "asc" },
      take: 200,
      select: { id: true, name: true, email: true },
    }),
  ]);

  return NextResponse.json({ staff, candidates });
}

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = grantSchema.parse(await req.json());
    const permissions = body.permissions.filter((p): p is AdminPermissionKey =>
      ALL_ADMIN_PERMISSIONS.includes(p as AdminPermissionKey),
    );
    if (permissions.length === 0) {
      return NextResponse.json({ error: "En az bir yetki seçmelisiniz." }, { status: 400 });
    }

    let userId = body.userId;

    if (userId) {
      const existing = await prisma.user.findUnique({ where: { id: userId } });
      if (!existing) {
        return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
      }
      if (existing.role === UserRole.SUPER_ADMIN) {
        return NextResponse.json({ error: "Super Admin yetkisi değiştirilemez." }, { status: 400 });
      }
    } else {
      if (!body.name || !body.email || !body.password) {
        return NextResponse.json({ error: "Yeni kullanıcı için ad, e-posta ve şifre gerekli." }, { status: 400 });
      }
      const email = body.email.toLowerCase().trim();
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) {
        return NextResponse.json({ error: "Bu e-posta zaten kayıtlı." }, { status: 409 });
      }

      const org = await prisma.organization.findFirst({ where: { slug: "myqr-platform" } });
      const user = await prisma.user.create({
        data: {
          email,
          name: body.name.trim(),
          passwordHash: await hashPassword(body.password),
          role: UserRole.PLATFORM_ADMIN,
          adminPermissions: serializeAdminPermissions(permissions),
          grantedById: auth.user.id,
          grantedAt: new Date(),
        },
      });

      if (org) {
        await prisma.membership.upsert({
          where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
          update: {},
          create: { userId: user.id, organizationId: org.id, role: MembershipRole.MEMBER },
        });
      }

      return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } }, { status: 201 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role: UserRole.PLATFORM_ADMIN,
        adminPermissions: serializeAdminPermissions(permissions),
        grantedById: auth.user.id,
        grantedAt: new Date(),
      },
      select: { id: true, email: true, name: true, adminPermissions: true, grantedAt: true },
    });

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz form verisi." }, { status: 400 });
    }
    return NextResponse.json({ error: "Yetki verilemedi." }, { status: 500 });
  }
}
