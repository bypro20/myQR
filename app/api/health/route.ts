import { NextResponse } from "next/server";
import { checkSchemaHealth } from "@/lib/db/schema-health";
import { createTursoClient, isTursoConfigured } from "@/lib/db/turso-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {
    turso: isTursoConfigured() ? "configured" : "skipped",
  };

  if (isTursoConfigured()) {
    try {
      const client = createTursoClient();
      await client!.execute("SELECT 1");
      checks.database = "ok";
    } catch {
      checks.database = "error";
    }

    const schema = await checkSchemaHealth();
    checks.schema = schema.ok ? "ok" : "drift";
    if (!schema.ok) {
      return NextResponse.json(
        { status: "degraded", checks, missing: schema.missing },
        { status: 503 },
      );
    }
  }

  return NextResponse.json({ status: "ok", checks });
}
