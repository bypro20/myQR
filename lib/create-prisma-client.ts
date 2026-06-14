import path from "path";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function dbPath() {
  const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const relative = url.replace(/^file:/, "");
  return path.isAbsolute(relative)
    ? relative
    : path.join(process.cwd(), relative.replace(/^\.\//, ""));
}

export function createPrismaClient() {
  const url = (process.env.DATABASE_URL || "").trim() || "file:./prisma/dev.db";

  if (process.env.VERCEL && !url.startsWith("libsql://") && !url.startsWith("https://")) {
    throw new Error("Production DATABASE_URL (libsql) tanımlı değil. Vercel env kontrol edin.");
  }

  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    const pool = new Pool({ connectionString: url });
    return new PrismaClient({ adapter: new PrismaPg(pool) });
  }

  if (url.startsWith("libsql://") || url.startsWith("https://")) {
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    return new PrismaClient({
      adapter: new PrismaLibSql({
        url,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }),
    });
  }

  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath()}` });
  return new PrismaClient({ adapter });
}
