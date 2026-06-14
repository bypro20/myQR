#!/usr/bin/env node
/**
 * Production setup: Turso schema + seed, Vercel env, deploy.
 * Reads secrets from .env.turso and .env.production (gitignored).
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync, spawnSync } from "child_process";
import { createClient } from "@libsql/client";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(name) {
  const path = join(root, name);
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

function saveProductionEnv(vars) {
  const lines = Object.entries(vars).map(([k, v]) => `${k}="${v}"`);
  writeFileSync(join(root, ".env.production"), lines.join("\n") + "\n");
}

async function tursoFetch(token, path, opts = {}) {
  const res = await fetch(`https://api.turso.tech${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text, status: res.status };
  }
}

async function applySchema(url, authToken, sqlFile) {
  const raw = readFileSync(sqlFile, "utf8");
  const statements = raw
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("--") && !s.startsWith("Loaded Prisma"));

  const client = createClient({ url, authToken });
  let applied = 0;
  for (const statement of statements) {
    try {
      await client.execute(statement);
      applied++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!/already exists|duplicate column/i.test(msg)) throw err;
    }
  }
  console.log(`Turso schema: ${applied}/${statements.length} statements`);
}

function run(cmd, env = {}) {
  execSync(cmd, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
}

function vercelEnv(name, value) {
  const r = spawnSync("npx", ["vercel", "env", "add", name, "production", "--force"], {
    cwd: root,
    input: value,
    encoding: "utf8",
  });
  if (r.status !== 0) {
    spawnSync("npx", ["vercel", "env", "add", name, "production"], {
      cwd: root,
      input: value,
      encoding: "utf8",
    });
  }
}

async function main() {
  const tursoEnv = loadEnvFile(".env.turso");
  const prodEnv = loadEnvFile(".env.production");
  const token = tursoEnv.TURSO_API_TOKEN;
  if (!token) throw new Error(".env.turso içinde TURSO_API_TOKEN yok");

  console.log("1/5 Turso DB...");
  await tursoFetch(token, "/v1/databases", {
    method: "POST",
    body: JSON.stringify({ name: "myqr-bypro20", group: "default" }),
  });

  const dbs = await tursoFetch(token, "/v1/databases");
  const db = dbs.databases?.find((d) => d.Name === "myqr-bypro20");
  if (!db?.Hostname) throw new Error("myqr-bypro20 DB bulunamadı");

  const databaseUrl = `libsql://${db.Hostname}`;
  const tokenRes = await tursoFetch(token, "/v1/databases/myqr-bypro20/auth/tokens", { method: "POST" });
  const tursoAuthToken = tokenRes.jwt;
  if (!tursoAuthToken) throw new Error("DB auth token alınamadı");

  console.log("2/5 Schema SQL...");
  execSync(
    "npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script",
    { cwd: root, encoding: "utf8" },
  );
  const sqlOut = execSync(
    "npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script 2>/dev/null | grep -v '^Loaded'",
    { cwd: root, encoding: "utf8", shell: "/bin/bash" },
  );
  const sqlFile = "/tmp/myqr-schema.sql";
  writeFileSync(sqlFile, sqlOut);

  console.log("3/5 Turso schema + seed...");
  await applySchema(databaseUrl, tursoAuthToken, sqlFile);
  run("npm run db:seed", { DATABASE_URL: databaseUrl, TURSO_AUTH_TOKEN: tursoAuthToken });

  const authSecret =
    prodEnv.AUTH_SECRET || execSync("openssl rand -hex 32", { encoding: "utf8" }).trim();

  const envVars = {
    DATABASE_URL: databaseUrl,
    TURSO_AUTH_TOKEN: tursoAuthToken,
    AUTH_SECRET: authSecret,
    ADMIN_EMAIL: prodEnv.ADMIN_EMAIL || "admin@myqr.com",
    ADMIN_PASSWORD: prodEnv.ADMIN_PASSWORD || "MyQR2026!Secure",
    ADMIN_NAME: prodEnv.ADMIN_NAME || "myQR Admin",
    NEXT_PUBLIC_APP_URL: prodEnv.NEXT_PUBLIC_APP_URL || "https://myqr.vercel.app",
    PAYMENT_MODE: "demo",
    PAYMENT_PROVIDER: "demo",
  };
  saveProductionEnv(envVars);

  console.log("4/5 Vercel env...");
  for (const [k, v] of Object.entries(envVars)) {
    vercelEnv(k, v);
    console.log(`  env: ${k}`);
  }

  console.log("5/5 Vercel deploy...");
  run("npx vercel deploy --prod --yes");

  console.log("\n✓ Deploy tamamlandı.");
  console.log("Admin:", envVars.ADMIN_EMAIL);
  console.log("URL:", envVars.NEXT_PUBLIC_APP_URL);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
