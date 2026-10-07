import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { ROLES } from "@/features/auth/constants";
import { getAdminProfile } from "@/features/users/services/user.service";
import { AdminProfile } from "@/features/users/components/AdminProfile";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login");
  if (sessionUser.role !== ROLES.ADMIN) redirect("/unauthorized");

  const profile = await getAdminProfile(sessionUser.id);
  if (!profile) redirect("/login");
  const pendingEmailChange = profile.emailChangeRequest;

  return (
    <AdminProfile
      user={{
        ...profile,
        createdAt: profile.createdAt.toISOString(),
        emailVerifiedAt: profile.emailVerifiedAt?.toISOString() ?? null,
        emailChangeOtpLastSentAt: profile.emailChangeOtpLastSentAt?.toISOString() ?? null,
        emailResendCooldownSeconds: profile.emailResendCooldownSeconds,
        emailChangeRequest: pendingEmailChange
          ? {
              ...pendingEmailChange,
              otpExpiresAt: pendingEmailChange.otpExpiresAt.toISOString(),
            }
          : null,
      }}
    />
  );
}
