import { NextRequest, NextResponse } from "next/server";
import { ActivityKind } from "@/app/generated/prisma/client";
import { loginAdminUser } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/security/audit";
import { getClientIp } from "@/lib/security/client-ip";
import { isHoneypotTripped } from "@/lib/security/honeypot";
import { clearLoginFailures, isLoginBlocked, loginDelay, recordLoginFailure } from "@/lib/security/login-shield";
import { isTurnstileEnabled, verifyTurnstile } from "@/lib/security/turnstile";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (isHoneypotTripped(body._hp)) {
    await loginDelay(800);
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }

  const block = isLoginBlocked(ip, email);
  if (block.blocked) {
    return NextResponse.json(
      { error: "Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin." },
      { status: 429, headers: block.retryAfterSec ? { "Retry-After": String(block.retryAfterSec) } : {} },
    );
  }

  if (isTurnstileEnabled()) {
    const ok = await verifyTurnstile(body.turnstileToken, ip);
    if (!ok) {
      return NextResponse.json({ error: "Güvenlik doğrulaması başarısız. Sayfayı yenileyin." }, { status: 400 });
    }
  }

  const result = await loginAdminUser(email, password);

  if (!result.ok) {
    await loginDelay(500);
    if (result.reason === "invalid") {
      recordLoginFailure(ip, email);
      void logSecurityEvent({
        kind: ActivityKind.SECURITY_LOGIN_FAILED,
        ip,
        email,
        path: "/api/auth/admin-login",
        message: `Başarısız admin girişi: ${email}`,
      });
    }
    if (result.reason === "customer_only") {
      return NextResponse.json(
        { error: "Bu hesap yönetici yetkisine sahip değil. Müşteri girişini kullanın." },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }

  clearLoginFailures(ip, email);

  return NextResponse.json({
    ok: true,
    user: { name: result.user.name, email: result.user.email, role: result.user.role },
    redirectTo: "/admin",
  });
}
