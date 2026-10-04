"use client";

import React, { useState } from "react";
import { ClipboardList, PackageSearch } from "lucide-react";
import { PosWorkspace } from "./PosWorkspace";
import { PosCart } from "./PosCart";
import { usePosStore } from "../../stores/usePosStore";
import type { PosProduct } from "./PosProductCard";
import type { PosService } from "./PosServiceCard";

interface PosPageClientProps {
  categories: Array<{ id: number; name: string }>;
  products: PosProduct[];
  services: PosService[];
  productDiscountRate: number;
}

export const PosPageClient: React.FC<PosPageClientProps> = ({
  categories,
  products,
  services,
  productDiscountRate,
}) => {
  const [mobileView, setMobileView] = useState<"catalog" | "order">("catalog");
  const cartItemCount = usePosStore((store) =>
    store.cartItems.reduce((count, item) => count + item.quantity, 0),
  );

  return (
    <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-3 sm:px-2.5 lg:block lg:h-[calc(100vh-5.5rem)] lg:min-h-0 lg:p-4">
      <div className="sticky top-0 z-20 -mx-2 bg-background px-2 pb-2 pt-1 sm:-mx-3 sm:px-3 md:hidden">
        <div className="flex min-h-12 items-center justify-between gap-2">
          <h1 className="min-w-0 truncate text-base font-semibold tracking-tight text-foreground">Point of sale</h1>
          <div
            className="grid shrink-0 grid-cols-2 gap-0.5 rounded-xl border border-border/70 bg-muted/60 p-0.5"
            role="group"
            aria-label="POS workspace view"
          >
            <button
              type="button"
              aria-pressed={mobileView === "catalog"}
              onClick={() => setMobileView("catalog")}
              className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${mobileView === "catalog" ? "bg-card text-foreground" : "text-muted-foreground"}`}
            >
              <PackageSearch className="size-3.5" />
              Browse
            </button>
            <button
              type="button"
              aria-pressed={mobileView === "order"}
              onClick={() => setMobileView("order")}
              className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${mobileView === "order" ? "bg-card text-foreground" : "text-muted-foreground"}`}
            >
              <ClipboardList className="size-3.5" />
              Order
              <span className="min-w-5 rounded-full bg-primary/10 px-1 py-0.5 text-[10px] tabular-nums text-primary">
                {cartItemCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-4">
        <div className={`min-w-0 ${mobileView === "catalog" ? "block" : "hidden"} lg:block lg:h-full lg:min-h-0`}>
          <PosWorkspace categories={categories} products={products} services={services} />
        </div>
        <div className={`min-w-0 ${mobileView === "order" ? "block" : "hidden"} lg:block lg:h-full lg:min-h-0`}>
          <PosCart productDiscountRate={productDiscountRate} />
        </div>
      </div>
    </div>
  );
};
