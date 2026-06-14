import { NextRequest, NextResponse } from "next/server";
import { destroySession, getSession, loginUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  const result = await loginUser(email, password);

  if (!result.ok) {
    if (result.reason === "admin_only") {
      return NextResponse.json(
        { error: "Bu hesap müşteri girişi ile kullanılamaz." },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    user: { name: result.user.name, email: result.user.email },
    organization: { name: result.organization.name, planTier: result.organization.planTier },
  });
}

export async function GET() {
  const session = await getSession();
  return NextResponse.json({ authenticated: Boolean(session) });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
