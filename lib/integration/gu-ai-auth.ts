import type { NextRequest } from "next/server";

export function verifyGuAiIntegration(req: NextRequest): boolean {
  const secret = process.env.GU_AI_INTEGRATION_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}` || auth === secret;
}

export function integrationConfigured(): boolean {
  return Boolean(process.env.GU_AI_INTEGRATION_SECRET);
}
