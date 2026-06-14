import { NextRequest, NextResponse } from "next/server";
import { loginAdminUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  const result = await loginAdminUser(email, password);

  if (!result.ok) {
    if (result.reason === "customer_only") {
      return NextResponse.json(
        { error: "Bu hesap yönetici yetkisine sahip değil. Müşteri girişini kullanın." },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    user: { name: result.user.name, email: result.user.email, role: result.user.role },
    redirectTo: "/admin",
  });
}
