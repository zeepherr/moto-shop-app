import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { getMemberPortalProfile } from "@/features/users/services/user.service";
import { MemberProfile } from "@/features/users/components/MemberProfile";
import { logAuthPerformance, startAuthTimer } from "@/lib/auth-performance";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login");
  if (sessionUser.role !== "MEMBER") redirect("/unauthorized");

  const dataStartedAt = startAuthTimer();
  const profile = await getMemberPortalProfile(sessionUser.id);
  logAuthPerformance("destination_page_data_ms", dataStartedAt);
  if (!profile) redirect("/login");

  return <MemberProfile user={profile} />;
}
