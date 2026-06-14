import { requirePlatformAdmin } from "@/lib/tenant";
import { DashboardShell } from "@/components/admin/dashboard-shell";
import { AdminNotificationProvider } from "@/components/admin/admin-notification-provider";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { organization } = await requirePlatformAdmin();

  return (
    <AdminNotificationProvider>
      <DashboardShell
        credits={organization.credits}
        unlimitedCredits={organization.unlimitedCredits}
        showAdminNotifications
        variant="admin"
      >
        {children}
      </DashboardShell>
    </AdminNotificationProvider>
  );
}
