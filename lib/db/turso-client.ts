import { createClient, type Client } from "@libsql/client";

export function isTursoConfigured() {
  const url = process.env.DATABASE_URL?.trim() || "";
  return url.startsWith("libsql://") && Boolean(process.env.TURSO_AUTH_TOKEN?.trim());
}

export function createTursoClient(): Client | null {
  if (!isTursoConfigured()) return null;
  return createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
}
