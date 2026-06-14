import type { Metadata } from "next";
import { UserRole } from "@/app/generated/prisma/client";
import { requireTenant } from "@/lib/tenant";
import { DashboardShell } from "@/components/admin/dashboard-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { organization, user } = await requireTenant();
  return (
    <DashboardShell
      credits={organization.credits}
      unlimitedCredits={organization.unlimitedCredits}
      isPartner={user.role === UserRole.PARTNER}
    >
      {children}
    </DashboardShell>
  );
}
