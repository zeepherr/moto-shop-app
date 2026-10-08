import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { getMemberPortalProfile } from "@/features/users/services/user.service";
import { MemberProfile } from "@/features/users/components/MemberProfile";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login");
  if (sessionUser.role !== "MEMBER") redirect("/unauthorized");

  const profile = await getMemberPortalProfile(sessionUser.id);
  if (!profile) redirect("/login");

  return <MemberProfile user={profile} />;
}
