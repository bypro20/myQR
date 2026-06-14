import { Clock } from "lucide-react";
import { qrLifecyclePricingTable } from "@/lib/qr/duration";
import { PRICING } from "@/lib/billing/pricing-config";
import { Badge } from "@/components/ui/badge";

type Props = {
  variant?: "light" | "dark";
  showRenewNote?: boolean;
  hideHeader?: boolean;
};

export function QrLifecyclePricing({ variant = "light", showRenewNote = true, hideHeader = false }: Props) {
  const rows = qrLifecyclePricingTable("DYNAMIC");
  const dark = variant === "dark";

  return (
    <section>
      {!hideHeader ? (
        <>
          <div className="flex items-center gap-2">
            <Clock className={`h-5 w-5 ${dark ? "text-cyan-400" : "text-violet-600"}`} />
            <h2 className={`text-lg font-bold ${dark ? "text-white" : "text-violet-950"}`}>
              QR süre paketleri
            </h2>
          </div>
          <p className={`mt-1 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>
            QR Code Generator ve Bitly modeli: {PRICING.freeQrTrialDays} gün ücretsiz deneme, süre bitince tarama durur.
            Devam için kredi paketi veya abonelik. Abonelikte aylık QR dahil; yıllık ve kalıcı indirimli.
          </p>
        </>
      ) : null}
      <div
        className={`${hideHeader ? "mt-0" : "mt-6"} overflow-hidden rounded-2xl border ${
          dark ? "border-white/10 bg-white/5" : "border-violet-100 bg-white shadow-sm"
        }`}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b text-left ${dark ? "border-white/10 bg-white/5" : "border-violet-50 bg-violet-50/50"}`}>
              <th className={`px-4 py-3 font-semibold ${dark ? "text-slate-300" : "text-slate-500"}`}>Paket</th>
              <th className={`px-4 py-3 font-semibold ${dark ? "text-slate-300" : "text-slate-500"}`}>Süre</th>
              <th className={`px-4 py-3 font-semibold ${dark ? "text-slate-300" : "text-slate-500"}`}>Oluşturma</th>
              {showRenewNote ? (
                <th className={`px-4 py-3 font-semibold ${dark ? "text-slate-300" : "text-slate-500"}`}>Uzatma</th>
              ) : null}
              <th className={`px-4 py-3 font-semibold ${dark ? "text-slate-300" : "text-slate-500"}`} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={`border-b last:border-0 ${dark ? "border-white/5" : "border-violet-50"}`}>
                <td className={`px-4 py-3 font-medium ${dark ? "text-white" : "text-violet-950"}`}>{row.label}</td>
                <td className={`px-4 py-3 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                  {row.days ? `${row.days} gün` : "Süresiz"}
                </td>
                <td className={`px-4 py-3 font-semibold ${dark ? "text-cyan-300" : "text-violet-700"}`}>
                  {row.id === "FREE_TRIAL" ? `${row.totalCredits} kr` : `${row.totalCredits} kr`}
                </td>
                {showRenewNote ? (
                  <td className={`px-4 py-3 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                    {row.id === "FREE_TRIAL" ? "—" : `${row.renewCredits} kr`}
                  </td>
                ) : null}
                <td className="px-4 py-3">
                  {row.badge ? <Badge variant={row.id === "FREE_TRIAL" ? "success" : "accent"}>{row.badge}</Badge> : null}
                  {row.recommended ? <Badge variant="warning">Popüler</Badge> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`mt-3 text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
        Dinamik QR taban: 3 kr · Statik QR taban: 1 kr. Starter+ abonelikte aylık QR lisansı dahil.
      </p>
    </section>
  );
}
