import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { createClient } from "@libsql/client";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const FETCH_TIMEOUT = 60_000;

async function fetchTurso(path, opts = {}) {
  const token = readFileSync(join(root, ".env.turso"), "utf8")
    .match(/TURSO_API_TOKEN=(.+)/)?.[1]?.trim();
  if (!token) throw new Error("TURSO_API_TOKEN missing");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    return await fetch(`https://api.turso.tech${path}`, {
      ...opts,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(opts.headers || {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

const token = readFileSync(join(root, ".env.turso"), "utf8")
  .match(/TURSO_API_TOKEN=(.+)/)?.[1]?.trim();
if (!token) throw new Error("TURSO_API_TOKEN missing");

await fetchTurso("/v1/databases", {
  method: "POST",
  body: JSON.stringify({ name: "myqr-bypro20", group: "default" }),
});

const dbs = await (await fetchTurso("/v1/databases")).json();
const db = dbs.databases?.find((d) => d.Name === "myqr-bypro20");
if (!db?.Hostname) throw new Error("DB not found");

const { jwt } = await (
  await fetchTurso("/v1/databases/myqr-bypro20/auth/tokens", { method: "POST" })
).json();

const DATABASE_URL = `libsql://${db.Hostname}`;
const AUTH_SECRET = execSync("openssl rand -hex 32", { encoding: "utf8" }).trim();

const sql = execSync(
  "npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script 2>/dev/null | grep -v '^Loaded'",
  { cwd: root, encoding: "utf8", shell: "/bin/bash" },
);

const client = createClient({ url: DATABASE_URL, authToken: jwt });
try {
  await client.executeMultiple(sql);
} catch (e) {
  const msg = String(e.message || e);
  if (!/already exists|duplicate column/i.test(msg)) throw e;
}
client.close();

writeFileSync(
  join(root, ".env.production"),
  [
    `DATABASE_URL="${DATABASE_URL}"`,
    `TURSO_AUTH_TOKEN="${jwt}"`,
    `AUTH_SECRET="${AUTH_SECRET}"`,
    `ADMIN_EMAIL="admin@myqr.com"`,
    `ADMIN_PASSWORD="MyQR2026!Secure"`,
    `ADMIN_NAME="myQR Admin"`,
    `NEXT_PUBLIC_APP_URL="https://myqr.prmdia.com"`,
    `PAYMENT_MODE="demo"`,
    `PAYMENT_PROVIDER="demo"`,
  ].join("\n") + "\n",
);

console.log("TURSO_OK");
