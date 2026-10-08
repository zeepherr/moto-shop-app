import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { ROLES } from "@/features/auth/constants";
import { StaffSalesPage } from "@/features/dashboard/components/StaffSalesPage";
import { getStaffDailySalesForUser } from "@/features/dashboard/services/staff-daily-sales.service";

export const metadata: Metadata = {
  title: "Daily Sales - HrungMoto",
  description: "Review your completed sales for today",
};

export const dynamic = "force-dynamic";

export default async function StaffSalesRoute() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== ROLES.STAFF) redirect("/unauthorized");

  const report = await getStaffDailySalesForUser(user);
  if (!report) redirect("/unauthorized");
  return <StaffSalesPage report={report} />;
}
