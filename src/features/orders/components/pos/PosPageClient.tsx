"use client";

import React, { useState } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
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
  const [activeView, setActiveView] = useState<"catalog" | "order">("catalog");
  const cartItemCount = usePosStore((store) =>
    store.cartItems.reduce((count, item) => count + item.quantity, 0),
  );

  return (
    <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-3 sm:px-2.5 lg:h-[calc(100dvh-5.5rem)] lg:min-h-0 lg:flex-col lg:p-4">
      <div className="sticky top-0 z-20 -mx-2 bg-background px-2 pb-2 pt-1 sm:-mx-3 sm:px-3 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pt-0 2xl:hidden">
        <div className="flex min-h-12 items-center justify-between gap-2">
          <h1 className="min-w-0 truncate text-base font-semibold tracking-tight text-foreground">Point of sale</h1>
          {activeView === "catalog" ? (
            <button
              type="button"
              onClick={() => setActiveView("order")}
              aria-label={`Open cart with ${cartItemCount} ${cartItemCount === 1 ? "item" : "items"}`}
              className="relative inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ShoppingCart className="size-4 text-primary" aria-hidden="true" />
              <span>Cart</span>
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-primary">
                {cartItemCount}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveView("catalog")}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span>Catalog</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-1 lg:gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className={`min-w-0 ${activeView === "catalog" ? "block" : "hidden"} lg:h-full lg:min-h-0 2xl:block`}>
          <PosWorkspace categories={categories} products={products} services={services} />
        </div>
        <div className={`min-w-0 ${activeView === "order" ? "block" : "hidden"} lg:h-full lg:min-h-0 2xl:block`}>
          <PosCart productDiscountRate={productDiscountRate} />
        </div>
      </div>
    </div>
  );
};
