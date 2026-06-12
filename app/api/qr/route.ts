import { NextRequest, NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth-api";
import { prisma } from "@/lib/prisma";
import { createQrCode } from "@/lib/qr/service";

export async function GET(req: NextRequest) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;

  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type");
  const mode = searchParams.get("mode");
  const page = Number(searchParams.get("page") || "1");
  const limit = 20;

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { customerName: { contains: q } },
            { projectName: { contains: q } },
            { shortCode: { contains: q } },
          ],
        }
      : {}),
    ...(type ? { type: type as never } : {}),
    ...(mode ? { mode: mode as never } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.qrCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.qrCode.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;
  const qr = await createQrCode(await req.json());
  return NextResponse.json(qr, { status: 201 });
}
