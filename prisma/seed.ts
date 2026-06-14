import "dotenv/config";
import { CreditTxType, MembershipRole, PlanTier, SubscriptionStatus, UserRole } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";
import { createPrismaClient } from "../lib/create-prisma-client";
import { UNLIMITED_CREDITS_BALANCE } from "../lib/credits";
import { TEMPLATE_PRESETS } from "../lib/qr/types";
import { slugify } from "../lib/utils";

const prisma = createPrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@myqr.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminName = process.env.ADMIN_NAME || "myQR Admin";

  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: UserRole.SUPER_ADMIN, name: adminName },
    create: {
      email: adminEmail,
      name: adminName,
      role: UserRole.SUPER_ADMIN,
      passwordHash: await bcrypt.hash(adminPassword, 12),
    },
  });

  let org = await prisma.organization.findUnique({ where: { slug: "myqr-platform" } });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: "myQR Platform",
        slug: "myqr-platform",
        planTier: PlanTier.BUSINESS,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        credits: UNLIMITED_CREDITS_BALANCE,
        unlimitedCredits: true,
      },
    });
  } else {
    org = await prisma.organization.update({
      where: { id: org.id },
      data: {
        planTier: PlanTier.BUSINESS,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        credits: UNLIMITED_CREDITS_BALANCE,
        unlimitedCredits: true,
      },
    });
  }

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: superAdmin.id, organizationId: org.id } },
    update: { role: MembershipRole.OWNER },
    create: {
      userId: superAdmin.id,
      organizationId: org.id,
      role: MembershipRole.OWNER,
    },
  });

  for (const preset of TEMPLATE_PRESETS) {
    const existing = await prisma.qrTemplate.findFirst({
      where: { name: preset.name, isSystem: true },
    });
    if (existing) continue;
    await prisma.qrTemplate.create({
      data: {
        name: preset.name,
        qrType: preset.qrType as never,
        defaultTitle: preset.name,
        dimensions: preset.dimensions,
        printFormat: preset.printFormat,
        isSystem: true,
      },
    });
  }

  const demoEmail = "demo@myqr.com";
  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "Demo Kullanıcı",
      passwordHash: await bcrypt.hash("demo123456", 12),
    },
  });

  const demoOrgSlug = slugify("Demo İşletme") + "-demo";
  let demoOrg = await prisma.organization.findUnique({ where: { slug: demoOrgSlug } });
  if (!demoOrg) {
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 14);
    demoOrg = await prisma.organization.create({
      data: {
        name: "Demo İşletme",
        slug: demoOrgSlug,
        planTier: PlanTier.PRO,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        trialEndsAt: trialEnds,
        credits: 200,
      },
    });
    await prisma.creditTransaction.create({
      data: {
        organizationId: demoOrg.id,
        type: CreditTxType.BONUS,
        amount: 200,
        balanceAfter: 200,
        description: "Hoş geldin bonusu",
      },
    });
  }

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: demoUser.id, organizationId: demoOrg.id } },
    update: {},
    create: {
      userId: demoUser.id,
      organizationId: demoOrg.id,
      role: MembershipRole.OWNER,
    },
  });

  console.log(`Seed tamamlandı.
  Super Admin: ${adminEmail} / ${adminPassword}
  Demo: ${demoEmail} / demo123456`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
