import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Package } from "lucide-react";

interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  stockQuantity: number;
  unit: string;
}

export const InventoryAlertWidget: React.FC<{ items: LowStockProduct[] }> = ({ items }) => {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 p-3.5 backdrop-blur-md transition-all sm:p-5">
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3 sm:pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle className="size-3.5" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Inventory Attention
            </h2>
            <p className="text-xs text-muted-foreground">
              Items at or below minimum threshold
            </p>
          </div>
        </div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#2997ff] hover:underline"
        >
          <span>Manage</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-border/40 pt-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Package className="h-7 w-7 text-muted-foreground/40 mb-1.5" />
            <p className="text-xs font-medium text-foreground">All inventory levels healthy</p>
            <p className="text-[11px] text-muted-foreground">No products are currently under 5 units</p>
          </div>
        ) : (
          items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 py-2.5">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                <p className="text-[11px] text-muted-foreground font-mono truncate">{item.sku}</p>
              </div>

              <div className="shrink-0 text-right">
                <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive border border-destructive/20">
                  {item.stockQuantity} {item.unit}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
