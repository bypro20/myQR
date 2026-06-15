import { createClient } from "@libsql/client";

/** Üretim Turso şemasını kodla uyumlu tutar (eksik sütunları ekler). */
const PATCHES = [
  "ALTER TABLE Organization ADD COLUMN parentOrganizationId TEXT",
];

async function main() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url?.startsWith("libsql://") || !authToken) {
    throw new Error("DATABASE_URL (libsql) ve TURSO_AUTH_TOKEN gerekli.");
  }

  const client = createClient({ url, authToken });
  let applied = 0;

  for (const sql of PATCHES) {
    try {
      await client.execute(sql);
      applied += 1;
      console.log("OK:", sql);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/duplicate column|already exists/i.test(msg)) {
        console.log("SKIP (exists):", sql);
        continue;
      }
      throw err;
    }
  }

  console.log(`Turso schema sync tamam (${applied} yeni patch).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
