import { DashboardShell } from "@/components/admin/dashboard-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
