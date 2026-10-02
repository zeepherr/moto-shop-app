import React from "react";
import { Wrench, CheckCircle2, CircleDollarSign, Sparkles } from "lucide-react";
import { QuickStatCard } from "@/components/management/QuickStatCard";
import type { MotoServiceDTO } from "../types";

export const ServiceStats: React.FC<{ services: MotoServiceDTO[] }> = ({
  services,
}) => {
  const total = services.length;
  const active = services.filter((s) => s.isActive).length;
  const prices = services.map((s) => Number(s.price));
  const avgPrice =
    total > 0
      ? Math.round(prices.reduce((a, b) => a + b, 0) / total)
      : 0;
  const maxPrice = total > 0 ? Math.max(...prices) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <QuickStatCard
        label="Total Services"
        value={total}
        subtext="Available packages & labor"
        icon={<Wrench className="size-4" />}
        tone="blue"
      />
      <QuickStatCard
        label="Active Offerings"
        value={active}
        subtext={`${total > 0 ? Math.round((active / total) * 100) : 0}% active service rate`}
        icon={<CheckCircle2 className="size-4" />}
        tone="success"
      />
      <QuickStatCard
        label="Average Rate"
        value={`฿${avgPrice.toLocaleString()}`}
        subtext="Across standard catalog"
        icon={<CircleDollarSign className="size-4" />}
        tone="default"
      />
      <QuickStatCard
        label="Premium Service"
        value={`฿${maxPrice.toLocaleString()}`}
        subtext="Highest tier service price"
        icon={<Sparkles className="size-4" />}
        tone="default"
      />
    </div>
  );
};
