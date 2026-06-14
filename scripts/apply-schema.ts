import { readFileSync } from "fs";
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url?.startsWith("libsql://") || !authToken) {
    throw new Error("DATABASE_URL (libsql) and TURSO_AUTH_TOKEN are required");
  }

  const sqlFile = process.argv[2] || "/tmp/myqr-schema.sql";
  const raw = readFileSync(sqlFile, "utf8");
  const statements = raw
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("--") && !s.startsWith("Loaded Prisma"));

  const client = createClient({ url, authToken });
  let applied = 0;
  for (const statement of statements) {
    if (!statement) continue;
    try {
      await client.execute(statement);
      applied += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!/already exists|duplicate column/i.test(msg)) throw err;
    }
  }
  console.log(`Applied ${applied} statements (${statements.length} total)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
