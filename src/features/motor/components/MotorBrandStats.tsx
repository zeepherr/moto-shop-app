import React from "react";
import { Bike, CheckCircle2, Layers } from "lucide-react";
import { QuickStatCard } from "@/components/management/QuickStatCard";
import type { MotorBrandDTO } from "../types";

export const MotorBrandStats: React.FC<{ brands: MotorBrandDTO[] }> = ({
  brands,
}) => {
  const total = brands.length;
  const active = brands.filter((b) => b.isActive).length;
  const totalModels = brands.reduce(
    (acc, b) => acc + (b._count?.motors ?? 0),
    0
  );

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
      <QuickStatCard
        compactOnMobile
        label="Total Brands"
        value={total}
        subtext="Registered manufacturers"
        icon={<Bike className="size-4" />}
        tone="blue"
      />
      <QuickStatCard
        compactOnMobile
        label="Active Brands"
        value={active}
        subtext={`${total > 0 ? Math.round((active / total) * 100) : 0}% active catalog rate`}
        icon={<CheckCircle2 className="size-4" />}
        tone="success"
      />
      <QuickStatCard
        compactOnMobile
        label="Models Linked"
        value={totalModels}
        subtext="Assigned motorcycle models"
        icon={<Layers className="size-4" />}
        tone="default"
      />
    </div>
  );
};
