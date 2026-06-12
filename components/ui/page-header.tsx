import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  description,
  action,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-violet-950 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action || (actionHref && actionLabel ? (
        <Link href={actionHref}><Button>{actionLabel}</Button></Link>
      ) : null)}
    </div>
  );
}
