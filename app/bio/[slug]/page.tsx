import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";
import type { BioLink } from "@/lib/qr/types";
import { QrCode } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export default async function BioPage({ params }: Props) {
  const { slug } = await params;
  const page = await prisma.linkBioPage.findUnique({
    where: { slug },
    include: { qrCode: { select: { expiresAt: true, isActive: true, durationTier: true, name: true } } },
  });
  if (!page || !page.qrCode.isActive) notFound();
  if (page.qrCode.expiresAt && page.qrCode.expiresAt.getTime() <= Date.now()) notFound();
  const links = parseJson<BioLink[]>(page.links, []);

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: `linear-gradient(180deg, ${page.bgColor} 0%, #f8fafc 100%)` }}>
      <div className="mx-auto max-w-md">
        <div className="rounded-[2rem] border border-white/60 bg-white/90 p-8 shadow-2xl shadow-violet-500/10 backdrop-blur">
          <div className="text-center">
            {page.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={page.logoUrl} alt="" className="mx-auto mb-4 h-20 w-20 rounded-full object-cover ring-4 ring-violet-100" />
            ) : (
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-violet-700"><QrCode className="h-8 w-8" /></div>
            )}
            <h1 className="text-2xl font-bold text-violet-950">{page.title}</h1>
            {page.description ? <p className="mt-2 text-slate-500">{page.description}</p> : null}
          </div>
          <div className="mt-8 space-y-3">
            {links.map((link) => (
              <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer"
                className="block rounded-2xl px-5 py-3.5 text-center text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]"
                style={{ backgroundColor: page.buttonColor }}>
                {link.label}
              </a>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-slate-400">myQR · QRBaskı</p>
        </div>
      </div>
    </div>
  );
}
