import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, refreshSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdminPermissionApi } from "@/lib/tenant";

const emailSchema = z.object({
  action: z.literal("email"),
  currentPassword: z.string().min(1),
  newEmail: z.string().email(),
});

const passwordSchema = z.object({
  action: z.literal("password"),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

const nameSchema = z.object({
  action: z.literal("name"),
  name: z.string().min(2).max(80),
});

export async function GET() {
  const auth = await requireAdminPermissionApi("settings_self");
  if (auth.error) return auth.error;

  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { id: true, email: true, name: true, role: true, createdAt: true, lastLoginAt: true },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminPermissionApi("settings_self");
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const action = body.action as string;

    if (action === "email") {
      const data = emailSchema.parse(body);
      const valid = await verifyPassword(data.currentPassword, auth.user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Mevcut şifre hatalı." }, { status: 403 });
      }

      const newEmail = data.newEmail.toLowerCase().trim();
      const taken = await prisma.user.findFirst({
        where: { email: newEmail, NOT: { id: auth.user.id } },
      });
      if (taken) {
        return NextResponse.json({ error: "Bu e-posta adresi kullanımda." }, { status: 409 });
      }

      const user = await prisma.user.update({
        where: { id: auth.user.id },
        data: { email: newEmail },
        select: { id: true, email: true, name: true, role: true },
      });

      await refreshSession({ email: newEmail });
      return NextResponse.json({ ok: true, user });
    }

    if (action === "password") {
      const data = passwordSchema.parse(body);
      const valid = await verifyPassword(data.currentPassword, auth.user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Mevcut şifre hatalı." }, { status: 403 });
      }

      await prisma.user.update({
        where: { id: auth.user.id },
        data: { passwordHash: await hashPassword(data.newPassword) },
      });

      return NextResponse.json({ ok: true });
    }

    if (action === "name") {
      const data = nameSchema.parse(body);
      const user = await prisma.user.update({
        where: { id: auth.user.id },
        data: { name: data.name.trim() },
        select: { id: true, email: true, name: true, role: true },
      });
      return NextResponse.json({ ok: true, user });
    }

    return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Geçersiz form verisi." }, { status: 400 });
    }
    return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  }
}
