import { NextRequest, NextResponse } from "next/server";
import { QrDurationTier } from "@/app/generated/prisma/client";
import { requireUserApi } from "@/lib/auth-api";
import { renewQrDuration } from "@/lib/qr/service";
import { handleQrWriteError } from "@/lib/qr/api-errors";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireUserApi();
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const durationTier = String(body.durationTier || "") as QrDurationTier;
    const { id } = await params;
    const qr = await renewQrDuration(auth.organization.id, id, durationTier);
    return NextResponse.json({ ok: true, qr });
  } catch (err) {
    if (err instanceof Error && err.message === "QR_NOT_FOUND") {
      return NextResponse.json({ error: "QR bulunamadı." }, { status: 404 });
    }
    return handleQrWriteError(err);
  }
}
