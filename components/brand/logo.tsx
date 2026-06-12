import { QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-lg shadow-violet-500/30">
        <QrCode className="h-5 w-5" />
      </div>
      {showText ? (
        <div>
          <p className="text-lg font-bold leading-none text-white">myQR</p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-violet-200">QRBaskı Studio</p>
        </div>
      ) : null}
    </div>
  );
}

export function LogoLight({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-lg shadow-violet-500/30">
        <QrCode className="h-6 w-6" />
      </div>
      <div>
        <p className="text-xl font-bold leading-none text-violet-950">myQR</p>
        <p className="text-xs font-medium text-slate-500">QRBaskı QR Yönetim</p>
      </div>
    </div>
  );
}
