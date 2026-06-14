import type { Metadata } from "next";
import { requireTenant } from "@/lib/tenant";
import { DashboardShell } from "@/components/admin/dashboard-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { organization } = await requireTenant();
  return (
    <DashboardShell credits={organization.credits} unlimitedCredits={organization.unlimitedCredits}>
      {children}
    </DashboardShell>
  );
}
