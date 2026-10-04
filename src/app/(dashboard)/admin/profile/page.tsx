import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/actions/session.action";
import { ROLES } from "@/features/auth/constants";
import { getUserAccountProfile } from "@/features/users/services/user.service";
import { StaffProfile } from "@/features/users/components/StaffProfile";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login");
  if (sessionUser.role !== ROLES.ADMIN) redirect("/unauthorized");

  const profile = await getUserAccountProfile(sessionUser.id);
  if (!profile) redirect("/login");

  return (
    <StaffProfile
      user={{
        ...profile,
        createdAt: profile.createdAt.toISOString(),
        emailVerifiedAt: profile.emailVerifiedAt?.toISOString() ?? null,
      }}
    />
  );
}
