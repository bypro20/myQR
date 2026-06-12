import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { TEMPLATE_PRESETS } from "../lib/qr/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adapter = new PrismaBetterSqlite3({ url: `file:${path.join(__dirname, "dev.db")}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@myqr.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "myQR Admin";

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name,
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

  for (const preset of TEMPLATE_PRESETS) {
    const existing = await prisma.qrTemplate.findFirst({ where: { name: preset.name } });
    if (existing) continue;
    await prisma.qrTemplate.create({
      data: {
        name: preset.name,
        qrType: preset.qrType as never,
        defaultTitle: preset.name,
        dimensions: preset.dimensions,
        printFormat: preset.printFormat,
      },
    });
  }

  console.log(`Seed tamamlandı. Admin: ${email} / ${password}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
