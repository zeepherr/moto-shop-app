import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { AppShell } from "@/components/app-shell/AppShell";
import { AuthPerfProbe } from "@/components/AuthPerfProbe";

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
  return (
    <AppShell
      user={user}
      workspace="Shop management"
      initialSidebarCollapsed={sidebarCollapsed}
    >
      <AuthPerfProbe />
      {children}
    </AppShell>
  );
}
