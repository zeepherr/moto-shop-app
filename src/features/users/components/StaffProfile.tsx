import { CalendarDays, ShieldCheck } from "lucide-react";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { StaffEmailChange } from "./StaffEmailChange";
import { StaffPasswordChange } from "./StaffPasswordChange";
import { StaffProfileDetails } from "./StaffProfileDetails";
import type { StaffProfileData } from "./staff-profile.types";

export function StaffProfile({ user }: { user: StaffProfileData }) {
  const joinedAt = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(new Date(user.createdAt));

  return (
    <ManagementLayout className="max-w-6xl !space-y-5 sm:!space-y-7">
      <header className="border-b border-border/70 pb-4 sm:pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">My profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your personal details and sign-in security.</p>
      </header>

      <div className="grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-10">
        <StaffProfileDetails user={user} />

        <div className="min-w-0 divide-y divide-border/70">
          <StaffEmailChange
            currentEmail={user.email ?? ""}
            emailVerified={Boolean(user.emailVerifiedAt)}
            resendCooldownSeconds={user.emailResendCooldownSeconds}
            expiresSeconds={user.emailChangeExpiresSeconds}
            pendingRequest={user.emailChangeRequest}
          />
          <StaffPasswordChange currentEmail={user.email ?? ""} />

          <section className="py-6" aria-labelledby="staff-account-details-heading">
            <h2 id="staff-account-details-heading" className="text-base font-semibold text-foreground">Account details</h2>
            <dl className="mt-3 divide-y divide-border/60 border-y border-border/60">
              <DetailRow icon={<ShieldCheck className="size-4" />} label="Role" value="Staff" />
              <DetailRow icon={<ShieldCheck className="size-4" />} label="Access" value={user.isActive ? "Active" : "Inactive"} />
              <DetailRow icon={<CalendarDays className="size-4" />} label="Member since" value={joinedAt} />
              <DetailRow icon={<ShieldCheck className="size-4" />} label="Account number" value={`#${user.id}`} />
            </dl>
          </section>
        </div>
      </div>
    </ManagementLayout>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-3 py-3">
      <span className="text-muted-foreground" aria-hidden="true">{icon}</span>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
