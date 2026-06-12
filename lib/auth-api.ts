import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function requireUserApi() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Yetkisiz." }, { status: 401 }) };
  }
  return { session };
}
