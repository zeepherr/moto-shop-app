import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { getStaffProfile } from "@/features/users/services/user.service";
import { StaffProfile } from "@/features/users/components/StaffProfile";

export const dynamic = "force-dynamic";

export default async function StaffProfilePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login");

  const profile = await getStaffProfile(sessionUser.id);
  if (!profile) redirect("/login");

  return (
    <StaffProfile
      user={{
        ...profile,
        createdAt: profile.createdAt.toISOString(),
        emailVerifiedAt: profile.emailVerifiedAt?.toISOString() ?? null,
        emailChangeOtpLastSentAt: profile.emailChangeOtpLastSentAt?.toISOString() ?? null,
        emailResendCooldownSeconds: profile.emailResendCooldownSeconds,
        emailChangeExpiresSeconds: profile.emailChangeExpiresSeconds,
        emailChangeRequest: profile.emailChangeRequest
          ? {
              ...profile.emailChangeRequest,
              otpExpiresAt: profile.emailChangeRequest.otpExpiresAt.toISOString(),
            }
          : null,
      }}
    />
  );
}
