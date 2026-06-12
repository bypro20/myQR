import { NextRequest, NextResponse } from "next/server";
import { createSession, destroySession, getSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }

  await createSession(user.id, user.email);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getSession();
  return NextResponse.json({ authenticated: Boolean(session) });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
