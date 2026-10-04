import {
  BadgeCheck,
  CalendarDays,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

interface StaffProfileData {
  id: number;
  role: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  userInfo: { photoUrl: string | null } | null;
}

export function StaffProfile({ user }: { user: StaffProfileData }) {
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const roleLabel = user.role === "ADMIN" ? "Administrator" : "Staff";
  const joinedAt = new Date(user.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <ManagementLayout className="max-w-5xl">
      <PageHeader
        title="My Profile"
        description="Review your identity, contact details, and account access"
      />

      <Card className="overflow-hidden border-border/70 shadow-xs">
        <CardContent className="p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground">
              {user.userInfo?.photoUrl ? (
                <Image
                  src={user.userInfo.photoUrl}
                  alt={fullName}
                  width={96}
                  height={96}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                <UserRound className="size-11" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {fullName}
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <ShieldCheck className="size-3.5" />
                  {roleLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Account #{user.id}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <AccountBadge
                  icon={BadgeCheck}
                  label={user.isActive ? "Account active" : "Account inactive"}
                  positive={user.isActive}
                />
                <AccountBadge
                  icon={Mail}
                  label={user.emailVerifiedAt ? "Email verified" : "Email not verified"}
                  positive={Boolean(user.emailVerifiedAt)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <ProfileSection title="Contact information" description="Details used for shop communication.">
          <ProfileRow icon={Mail} label="Email" value={user.email} />
          <ProfileRow icon={Phone} label="Phone" value={user.phone} />
        </ProfileSection>

        <ProfileSection title="Account details" description="Your role and account history.">
          <ProfileRow icon={ShieldCheck} label="Role" value={roleLabel} />
          <ProfileRow icon={CalendarDays} label="Joined" value={joinedAt} />
        </ProfileSection>
      </div>
    </ManagementLayout>
  );
}

function ProfileSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/70 shadow-xs">
      <CardContent className="p-5 sm:p-6">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <div className="mt-5 space-y-4">{children}</div>
      </CardContent>
    </Card>
  );
}

function ProfileRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

function AccountBadge({ icon: Icon, label, positive }: { icon: LucideIcon; label: string; positive: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium ${positive ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "border-border bg-muted text-muted-foreground"}`}>
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}
