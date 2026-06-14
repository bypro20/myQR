import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MembershipRole, UserRole } from "@/app/generated/prisma/client";
import { hasAdminPanelAccess } from "@/lib/admin-permissions";
import { logActivity } from "@/lib/admin/activity-log";
import { prisma } from "@/lib/prisma";
import { ActivityKind } from "@/app/generated/prisma/client";

const COOKIE = "myqr_session";

export type SessionPayload = {
  userId: string;
  email: string;
  organizationId: string;
  membershipRole: MembershipRole;
  systemRole: UserRole;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET tanımlı değil");
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error("AUTH_SECRET üretimde en az 32 karakter olmalı");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    organizationId: payload.organizationId,
    membershipRole: payload.membershipRole,
    systemRole: payload.systemRole,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    priority: "high",
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      organizationId: String(payload.organizationId),
      membershipRole: payload.membershipRole as MembershipRole,
      systemRole: payload.systemRole as UserRole,
    };
  } catch {
    return null;
  }
}

export async function refreshSession(updates: Partial<Pick<SessionPayload, "email" | "membershipRole" | "systemRole">>) {
  const session = await getSession();
  if (!session) return;
  await createSession({
    userId: session.userId,
    email: updates.email ?? session.email,
    organizationId: session.organizationId,
    membershipRole: updates.membershipRole ?? session.membershipRole,
    systemRole: updates.systemRole ?? session.systemRole,
  });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.isActive) redirect("/login");
  return user;
}

export type LoginResult =
  | { ok: true; user: { id: string; email: string; name: string; role: UserRole }; organization: { id: string; name: string; planTier: string } }
  | { ok: false; reason: "invalid" | "admin_only" | "customer_only" };

async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      memberships: {
        include: { organization: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });
  if (!user?.isActive) return null;
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;
  const membership = user.memberships[0];
  if (!membership) return null;
  return { user, organization: membership.organization, membership };
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const auth = await authenticateUser(email, password);
  if (!auth) return { ok: false, reason: "invalid" };

  if (hasAdminPanelAccess(auth.user)) {
    return { ok: false, reason: "admin_only" };
  }

  await prisma.user.update({
    where: { id: auth.user.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession({
    userId: auth.user.id,
    email: auth.user.email,
    organizationId: auth.membership.organizationId,
    membershipRole: auth.membership.role,
    systemRole: auth.user.role,
  });

  void logActivity({
    kind: ActivityKind.USER_LOGIN,
    actorUserId: auth.user.id,
    organizationId: auth.organization.id,
    targetType: "user",
    targetId: auth.user.id,
    targetLabel: auth.user.name,
    message: `${auth.user.name} (${auth.user.email}) müşteri paneline giriş yaptı`,
  });

  return {
    ok: true,
    user: { id: auth.user.id, email: auth.user.email, name: auth.user.name, role: auth.user.role },
    organization: {
      id: auth.organization.id,
      name: auth.organization.name,
      planTier: auth.organization.planTier,
    },
  };
}

export async function loginAdminUser(email: string, password: string): Promise<LoginResult> {
  const auth = await authenticateUser(email, password);
  if (!auth) return { ok: false, reason: "invalid" };

  if (!hasAdminPanelAccess(auth.user)) {
    return { ok: false, reason: "customer_only" };
  }

  await prisma.user.update({
    where: { id: auth.user.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession({
    userId: auth.user.id,
    email: auth.user.email,
    organizationId: auth.membership.organizationId,
    membershipRole: auth.membership.role,
    systemRole: auth.user.role,
  });

  void logActivity({
    kind: ActivityKind.ADMIN_LOGIN,
    actorUserId: auth.user.id,
    actorRole: auth.user.role,
    organizationId: auth.organization.id,
    targetType: "user",
    targetId: auth.user.id,
    targetLabel: auth.user.name,
    message: `${auth.user.name} (${auth.user.email}) admin paneline giriş yaptı`,
  });

  return {
    ok: true,
    user: { id: auth.user.id, email: auth.user.email, name: auth.user.name, role: auth.user.role },
    organization: {
      id: auth.organization.id,
      name: auth.organization.name,
      planTier: auth.organization.planTier,
    },
  };
}
