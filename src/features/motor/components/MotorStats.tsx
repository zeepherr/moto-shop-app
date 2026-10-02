import React from "react";
import { Bike, ShieldCheck, Gauge, Cog } from "lucide-react";
import { QuickStatCard } from "@/components/management/QuickStatCard";
import type { MotorDTO, MotorBrandDTO } from "../types";

export const MotorStats: React.FC<{
  motors: MotorDTO[];
  brands: MotorBrandDTO[];
}> = ({ motors, brands }) => {
  const total = motors.length;
  const active = motors.filter((m) => m.isActive).length;
  const automaticCount = motors.filter((m) => m.type === "AUTOMATIC").length;
  const manualCount = motors.filter((m) => m.type === "MANUAL").length;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <QuickStatCard
        label="Total Models"
        value={total}
        subtext={`${brands.length} manufacturers`}
        icon={<Bike className="size-4" />}
        tone="blue"
      />
      <QuickStatCard
        label="Active Models"
        value={active}
        subtext={`${total > 0 ? Math.round((active / total) * 100) : 0}% active catalog`}
        icon={<ShieldCheck className="size-4" />}
        tone="success"
      />
      <QuickStatCard
        label="Automatic"
        value={automaticCount}
        subtext="Scooter & CVT models"
        icon={<Gauge className="size-4" />}
        tone="default"
      />
      <QuickStatCard
        label="Manual"
        value={manualCount}
        subtext="Clutch & gear models"
        icon={<Cog className="size-4" />}
        tone="default"
      />
    </div>
  );
};
