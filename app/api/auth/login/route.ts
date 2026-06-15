import { NextRequest, NextResponse } from "next/server";
import { ActivityKind } from "@/app/generated/prisma/client";
import { requireDbReady } from "@/lib/db/require-db-ready";
import { destroySession, getSession, loginUser } from "@/lib/auth";
import { logSecurityEvent } from "@/lib/security/audit";
import { getClientIp } from "@/lib/security/client-ip";
import { isHoneypotTripped } from "@/lib/security/honeypot";
import { clearLoginFailures, isLoginBlocked, loginDelay, recordLoginFailure } from "@/lib/security/login-shield";
import { isTurnstileEnabled, verifyTurnstile } from "@/lib/security/turnstile";

export async function POST(req: NextRequest) {
  const dbBlock = await requireDbReady();
  if (dbBlock) return dbBlock;

  const ip = getClientIp(req);
  const body = await req.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (isHoneypotTripped(body._hp)) {
    await loginDelay(600);
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

  const result = await loginUser(email, password);

  if (!result.ok) {
    await loginDelay();
    if (result.reason === "invalid") {
      recordLoginFailure(ip, email);
      void logSecurityEvent({
        kind: ActivityKind.SECURITY_LOGIN_FAILED,
        ip,
        email,
        path: "/api/auth/login",
        message: `Başarısız müşteri girişi: ${email}`,
      });
    }
    if (result.reason === "admin_only") {
      return NextResponse.json(
        { error: "Bu hesap müşteri girişi ile kullanılamaz." },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }

  clearLoginFailures(ip, email);

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
