import { requireSuperAdmin } from "@/lib/tenant";
import { AdminStaffPanel } from "@/components/admin/admin-staff-panel";

export default async function AdminStaffPage() {
  await requireSuperAdmin();
  return <AdminStaffPanel />;
}
