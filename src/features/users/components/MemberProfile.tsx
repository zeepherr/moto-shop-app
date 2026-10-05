"use client";

import React from "react";
import {
  Bike,
  CalendarDays,
  Mail,
  Phone,
  UserRound,
  WalletCards,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

interface UserProfileData {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: Date | string;
  userInfo?: { photoUrl?: string | null } | null;
  userMotors?: Array<{
    motorId: number;
    motor?: {
      model: string;
      type: string;
      motorBrand?: { name: string } | null;
    } | null;
  }>;
  stats?: {
    totalVisits: number;
    totalSpent: number;
  };
}

export const MemberProfile: React.FC<{ user: UserProfileData | null }> = ({ user }) => {
  if (!user) return null;

  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const photoUrl = user.userInfo?.photoUrl;
  const joinedAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
  const totalSpent = Number(user.stats?.totalSpent ?? 0);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Card className="overflow-hidden border-border/60 shadow-xs">
        <div className="member-profile-banner h-28 bg-gradient-to-r from-primary/20 via-primary/10 to-background sm:h-36" />
        <CardContent className="relative px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-background bg-muted shadow-md sm:size-28">
                {photoUrl ? (
                  <img src={photoUrl} alt={fullName} className="size-full object-cover" />
                ) : (
                  <UserRound className="size-11 text-muted-foreground sm:size-12" />
                )}
              </div>

              <div className="space-y-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {fullName}
                  </h1>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {user.role}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Member #{user.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/60">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Wrench className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shop visits</p>
              <p className="text-2xl font-semibold text-foreground">
                {user.stats?.totalVisits ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <WalletCards className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total spent</p>
              <p className="text-2xl font-semibold text-foreground">
                ฿{totalSpent.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">Personal information</h2>
              <p className="text-sm text-muted-foreground">Member contact and account details.</p>
            </div>

            <div className="space-y-4">
              <ProfileRow icon={UserRound} label="First name" value={user.firstName} />
              <ProfileRow icon={UserRound} label="Last name" value={user.lastName} />
              <ProfileRow icon={Mail} label="Email" value={user.email} />
              <ProfileRow icon={Phone} label="Phone" value={user.phone} />
              <ProfileRow icon={CalendarDays} label="Joined" value={joinedAt} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">Motorcycles</h2>
              <p className="text-sm text-muted-foreground">Motorcycles registered to this member.</p>
            </div>

            {user.userMotors && user.userMotors.length > 0 ? (
              <div className="space-y-3">
                {user.userMotors.map(({ motorId, motor }) => (
                  <div key={motorId} className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-card">
                      <Bike className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {motor?.motorBrand?.name ?? "Unknown Brand"} {motor?.model ?? "Unknown Model"}
                      </p>
                      <p className="text-sm text-muted-foreground">{motor?.type ?? "Motorcycle"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/10 p-6 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-card">
                  <Bike className="size-5 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">No motorcycle registered</p>
                <p className="mt-1 text-sm text-muted-foreground">This member has no motorcycle information yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="pt-2">
        <LogoutButton />
      </div>
    </div>
  );
};

function ProfileRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value || "Not provided"}</p>
      </div>
    </div>
  );
}
