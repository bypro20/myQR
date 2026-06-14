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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">{description}</p>
        ) : null}
      </div>
      {action ||
        (actionHref && actionLabel ? (
          <Link href={actionHref}>
            <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700">
              {actionLabel}
            </Button>
          </Link>
        ) : null)}
    </div>
  );
}
