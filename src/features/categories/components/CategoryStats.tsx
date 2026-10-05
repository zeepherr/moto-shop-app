import React from "react";
import { FolderTree, CheckCircle2, Package } from "lucide-react";
import { QuickStatCard } from "@/components/management/QuickStatCard";
import type { ProductCategoryDTO } from "../types";

export const CategoryStats: React.FC<{
  categories: ProductCategoryDTO[];
}> = ({ categories }) => {
  const total = categories.length;
  const active = categories.filter((c) => c.isActive).length;
  const totalProducts = categories.reduce(
    (acc, c) => acc + (c._count?.products ?? 0),
    0
  );

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
      <QuickStatCard
        compactOnMobile
        label="Total Categories"
        value={total}
        subtext="Product classifications"
        icon={<FolderTree className="size-4" />}
        tone="blue"
      />
      <QuickStatCard
        compactOnMobile
        label="Active Categories"
        value={active}
        subtext={`${total > 0 ? Math.round((active / total) * 100) : 0}% active catalog rate`}
        icon={<CheckCircle2 className="size-4" />}
        tone="success"
      />
      <QuickStatCard
        compactOnMobile
        label="Products Assigned"
        value={totalProducts}
        subtext="Total items linked to categories"
        icon={<Package className="size-4" />}
        tone="default"
      />
    </div>
  );
};
