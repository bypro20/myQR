import { NextResponse } from "next/server";
import { requireTenantApi } from "@/lib/tenant";

export { requireTenantApi };

export async function requireUserApi() {
  return requireTenantApi();
}
