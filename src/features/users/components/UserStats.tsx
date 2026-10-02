import React from "react";
import { Users, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";
import { QuickStatCard } from "@/components/management/QuickStatCard";

interface UserStatsProps {
  total: number;
  adminCount: number;
  staffCount: number;
  memberCount: number;
}

export const UserStats: React.FC<UserStatsProps> = ({
  total,
  adminCount,
  staffCount,
  memberCount,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <QuickStatCard
        label="Total Accounts"
        value={total}
        subtext="All registered users"
        icon={<Users className="size-4" />}
        tone="blue"
      />
      <QuickStatCard
        label="Administrators"
        value={adminCount}
        subtext="Full system access"
        icon={<ShieldAlert className="size-4" />}
        tone="blue"
      />
      <QuickStatCard
        label="Staff Members"
        value={staffCount}
        subtext="Technicians & cashiers"
        icon={<ShieldCheck className="size-4" />}
        tone="success"
      />
      <QuickStatCard
        label="Customers"
        value={memberCount}
        subtext="Registered vehicle owners"
        icon={<UserCheck className="size-4" />}
        tone="default"
      />
    </div>
  );
};
