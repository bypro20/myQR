import { NextRequest, NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;
  const items = await prisma.qrTemplate.findMany({
    where: {
      OR: [{ isSystem: true }, { organizationId: auth.organization.id }],
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;
  const body = await req.json();
  const item = await prisma.qrTemplate.create({
    data: { ...body, organizationId: auth.organization.id, isSystem: false },
  });
  return NextResponse.json(item, { status: 201 });
}
