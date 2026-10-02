import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { AppShell } from "@/components/app-shell/AppShell";
import { ROLES } from "@/features/auth/constants";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const sidebarCollapsed = cookieStore.get("sidebar-collapsed")?.value === "true";
  const section =
    user.role === ROLES.ADMIN
      ? "Administration"
      : user.role === ROLES.STAFF
        ? "Staff workspace"
        : "Member portal";

  return (
    <AppShell
      user={user}
      section={section}
      workspace="Shop management"
      initialSidebarCollapsed={sidebarCollapsed}
    >
      {children}
    </AppShell>
  );
}
