import path from "path";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function dbPath() {
  const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const relative = url.replace(/^file:/, "");
  return path.isAbsolute(relative)
    ? relative
    : path.join(process.cwd(), relative.replace(/^\.\//, ""));
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath()}` });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
