import React from "react";
import { Package, CheckCircle2, AlertTriangle, Coins } from "lucide-react";
import { QuickStatCard } from "@/components/management/QuickStatCard";
import type { ProductDTO } from "../types";

export const ProductStats: React.FC<{ products: ProductDTO[] }> = ({
  products,
}) => {
  const total = products.length;
  const inStock = products.filter((p) => p.stockQuantity > 0).length;
  const lowStock = products.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity <= 5
  ).length;
  const outOfStock = products.filter((p) => p.stockQuantity === 0).length;
  const inventoryValuation = products.reduce(
    (acc, p) => acc + Number(p.sellingPrice) * p.stockQuantity,
    0
  );

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
      <QuickStatCard
        compactOnMobile
        label="Total SKUs"
        value={total}
        subtext={`${inStock} items in active stock`}
        icon={<Package className="size-4" />}
        tone="blue"
      />
      <QuickStatCard
        compactOnMobile
        label="Stock Health"
        value={`${total > 0 ? Math.round((inStock / total) * 100) : 0}%`}
        subtext={`${outOfStock} out of stock`}
        icon={<CheckCircle2 className="size-4" />}
        tone={outOfStock > 0 ? "warning" : "success"}
      />
      <QuickStatCard
        compactOnMobile
        label="Low Stock Alert"
        value={lowStock}
        subtext="Items with <= 5 units remaining"
        icon={<AlertTriangle className="size-4" />}
        tone={lowStock > 0 ? "warning" : "default"}
      />
      <QuickStatCard
        compactOnMobile
        label="Inventory Value"
        value={`฿${Math.round(inventoryValuation).toLocaleString()}`}
        subtext="Total retail value on hand"
        icon={<Coins className="size-4" />}
        tone="default"
      />
    </div>
  );
};
