import { createTursoClient, isTursoConfigured } from "../lib/db/turso-client";
import { checkSchemaHealth, clearSchemaHealthCache } from "../lib/db/schema-health";
import { applySqlFile, collectPatchFiles } from "../lib/db/apply-sql-patches";
import path from "path";

async function main() {
  if (!isTursoConfigured()) {
    if (process.env.VERCEL === "1") {
      console.error("[sync-turso-schema] Vercel build: DATABASE_URL/TURSO_AUTH_TOKEN eksik!");
      process.exit(1);
    }
    console.log("[sync-turso-schema] Turso yok — yerel build, atlanıyor.");
    return;
  }

  const client = createTursoClient();
  if (!client) throw new Error("Turso client oluşturulamadı.");

  const scriptsDir = path.join(process.cwd(), "scripts");
  const files = collectPatchFiles(scriptsDir);
  let totalApplied = 0;

  for (const file of files) {
    try {
      const n = await applySqlFile(client, file);
      totalApplied += n;
      console.log(`[sync-turso-schema] ${path.basename(file)}: ${n} ifade`);
    } catch (err) {
      console.error(`[sync-turso-schema] HATA ${file}:`, err);
      process.exit(1);
    }
  }

  clearSchemaHealthCache();
  const health = await checkSchemaHealth();
  if (!health.ok) {
    console.error("[sync-turso-schema] Şema doğrulama başarısız:", health.missing.join(", "));
    process.exit(1);
  }

  console.log(`[sync-turso-schema] Tamam (${totalApplied} SQL ifadesi, şema doğrulandı).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
