import { redirect } from "next/navigation";
import { requireAdminRouteAccess } from "@/lib/tenant";

export default async function AdminPaymentsPage() {
  await requireAdminRouteAccess("/admin/payments");
  redirect("/admin/sales");
}
