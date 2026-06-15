import { createTursoClient, isTursoConfigured } from "@/lib/db/turso-client";

/** Kritik tablolar — eksik sütun kayıt/ödeme/girişi kırar */
export const REQUIRED_COLUMNS: Record<string, string[]> = {
  Organization: [
    "id",
    "name",
    "slug",
    "parentOrganizationId",
    "planTier",
    "subscriptionStatus",
    "trialEndsAt",
    "subscriptionEndsAt",
    "credits",
    "unlimitedCredits",
    "qrCount",
    "createdAt",
    "updatedAt",
  ],
  User: [
    "id",
    "email",
    "passwordHash",
    "name",
    "role",
    "adminPermissions",
    "grantedById",
    "grantedAt",
    "isActive",
    "lastLoginAt",
    "createdAt",
    "updatedAt",
  ],
  Membership: ["id", "userId", "organizationId", "role", "createdAt"],
  CreditTransaction: ["id", "organizationId", "type", "amount", "balanceAfter", "createdAt"],
  PaymentOrder: ["id", "organizationId", "packageId", "amountTry", "credits", "status", "createdAt"],
  QrCode: ["id", "organizationId", "name", "mode", "durationTier", "expiresAt", "createdAt"],
};

const REQUIRED_TABLES = ["ActivityLog"];

type HealthResult = { ok: boolean; missing: string[] };

let cache: { result: HealthResult; at: number } | null = null;
const CACHE_MS = 45_000;

async function tableColumns(table: string): Promise<Set<string>> {
  const client = createTursoClient();
  if (!client) return new Set();

  const res = await client.execute(`PRAGMA table_info(${table})`);
  const names = new Set<string>();
  for (const row of res.rows) {
    const name = row.name;
    if (typeof name === "string") names.add(name);
  }
  return names;
}

async function tableExists(table: string): Promise<boolean> {
  const client = createTursoClient();
  if (!client) return true;

  const res = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
    [table],
  );
  return res.rows.length > 0;
}

export async function checkSchemaHealth(): Promise<HealthResult> {
  if (!isTursoConfigured()) {
    return { ok: true, missing: [] };
  }

  if (cache && Date.now() - cache.at < CACHE_MS) {
    return cache.result;
  }

  const missing: string[] = [];

  for (const table of REQUIRED_TABLES) {
    if (!(await tableExists(table))) {
      missing.push(`table:${table}`);
    }
  }

  for (const [table, columns] of Object.entries(REQUIRED_COLUMNS)) {
    if (!(await tableExists(table))) {
      missing.push(`table:${table}`);
      continue;
    }
    const existing = await tableColumns(table);
    for (const col of columns) {
      if (!existing.has(col)) {
        missing.push(`${table}.${col}`);
      }
    }
  }

  const result = { ok: missing.length === 0, missing };
  cache = { result, at: Date.now() };
  return result;
}

export function clearSchemaHealthCache() {
  cache = null;
}
