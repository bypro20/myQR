import { NextResponse } from "next/server";
import { checkSchemaHealth } from "@/lib/db/schema-health";

/** Kritik API'lerde şema uyumsuzluğunda 503 döner */
export async function requireDbReady(): Promise<NextResponse | null> {
  const health = await checkSchemaHealth();
  if (health.ok) return null;

  console.error("[requireDbReady] Turso şema eksik:", health.missing.join(", "));
  return NextResponse.json(
    {
      error: "Sistem geçici olarak kullanılamıyor. Lütfen birkaç dakika sonra tekrar deneyin.",
      code: "DB_SCHEMA_DRIFT",
    },
    { status: 503 },
  );
}
