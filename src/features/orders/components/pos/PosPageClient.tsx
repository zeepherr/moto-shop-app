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
    <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-3 sm:px-2.5 lg:h-[calc(100dvh-1.5rem)] lg:min-h-0 lg:flex-col lg:p-4">
      <h1 className="sr-only">Point of sale</h1>
      <div className="sticky top-2 z-30 -mx-2 flex justify-end px-2 sm:-mx-3 sm:px-3 2xl:hidden">
        <div className="flex min-h-11 items-center justify-end gap-2">
          {activeView === "catalog" ? (
            <button
              type="button"
              onClick={() => setActiveView("order")}
              aria-label={`Open cart with ${cartItemCount} ${cartItemCount === 1 ? "item" : "items"}`}
              className="relative inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/55 bg-white/75 px-4 text-sm font-semibold text-foreground shadow-[0_10px_28px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-2xl backdrop-saturate-150 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/15 dark:bg-card/75 dark:hover:bg-card/90"
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
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/55 bg-white/75 px-4 text-sm font-semibold text-primary shadow-[0_10px_28px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-2xl backdrop-saturate-150 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/15 dark:bg-card/75 dark:hover:bg-card/90"
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
