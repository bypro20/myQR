import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";

type ExpiringQr = {
  id: string;
  name: string;
  state: "expired" | "critical" | "warning";
  label: string;
};

type Props = {
  items: ExpiringQr[];
};

export function QrExpiryBanner({ items }: Props) {
  if (items.length === 0) return null;

  const expired = items.filter((i) => i.state === "expired");
  const urgent = items.filter((i) => i.state !== "expired");

  return (
    <div className="space-y-3">
      {expired.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">
                {expired.length} QR süresi doldu — taramalar engellendi
              </p>
              <p className="mt-0.5 text-sm text-red-800">
                {expired.slice(0, 3).map((q) => q.name).join(", ")}
                {expired.length > 3 ? ` +${expired.length - 3} daha` : ""}
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/qr/${expired[0].id}`}
            className="shrink-0 rounded-xl bg-red-600 px-4 py-2 text-center text-sm font-bold text-white hover:bg-red-700"
          >
            Süreyi uzat
          </Link>
        </div>
      ) : null}

      {urgent.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Clock className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">
                {urgent.length} QR süresi yakında doluyor
              </p>
              <p className="mt-0.5 text-sm text-amber-800">
                {urgent.slice(0, 3).map((q) => `${q.name} (${q.label})`).join(" · ")}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="shrink-0 rounded-xl border border-amber-300 bg-white px-4 py-2 text-center text-sm font-bold text-amber-900 hover:bg-amber-50"
          >
            Kredi yükle
          </Link>
        </div>
      ) : null}
    </div>
  );
}
