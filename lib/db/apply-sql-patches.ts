import { readFileSync, readdirSync } from "fs";
import path from "path";
import type { Client } from "@libsql/client";

function splitStatements(raw: string) {
  return raw
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("--") && !s.startsWith("Loaded Prisma"));
}

export async function applySqlFile(client: Client, filePath: string) {
  const raw = readFileSync(filePath, "utf8");
  const statements = splitStatements(raw);
  let applied = 0;

  for (const statement of statements) {
    try {
      await client.execute(statement);
      applied += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/already exists|duplicate column/i.test(msg)) continue;
      throw new Error(`${path.basename(filePath)}: ${msg}`);
    }
  }

  return applied;
}

export function collectPatchFiles(root: string) {
  const files: string[] = [];
  const legacy = [
    "patch-platform-admin.sql",
    "patch-unlimited-credits.sql",
    "patch-activity-log.sql",
    "patch-qr-duration.sql",
  ];
  for (const name of legacy) {
    files.push(path.join(root, name));
  }

  const patchesDir = path.join(root, "patches");
  try {
    const numbered = readdirSync(patchesDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();
    for (const f of numbered) {
      files.push(path.join(patchesDir, f));
    }
  } catch {
    /* patches klasörü yoksa yoksay */
  }

  return files;
}
