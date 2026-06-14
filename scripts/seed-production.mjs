import { readFileSync } from "fs";
import { spawnSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...process.env };
for (const line of readFileSync(join(root, ".env.production"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)="(.*)"$/);
  if (m) env[m[1]] = m[2];
}

const r = spawnSync("npx", ["tsx", "prisma/seed.ts"], { cwd: root, env, stdio: "inherit" });
process.exit(r.status ?? 1);
