import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

for (const line of readFileSync(".env.production", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)="(.*)"$/);
  if (m) process.env[m[1]] = m[2];
}

const url = process.env.DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;
const client = createClient({ url, authToken: token });
const r = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
console.log("TABLES", r.rows.length);
client.close();

import { createPrismaClient } from "../lib/create-prisma-client.ts";
const prisma = createPrismaClient();
try {
  const count = await prisma.user.count();
  console.log("USERS", count);
} catch (e) {
  console.error("PRISMA_ERR", e.message);
}
await prisma.$disconnect();
