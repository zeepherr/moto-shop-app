import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { getUserProfile } from "@/features/users/services/user.service";
import { MemberProfile } from "@/features/users/components/MemberProfile";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login");

  const profile = await getUserProfile(sessionUser.id);
  if (!profile) redirect("/login");

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <MemberProfile
        user={{
          ...profile,
          createdAt: profile.createdAt.toISOString(),
        }}
      />
    </div>
  );
}
