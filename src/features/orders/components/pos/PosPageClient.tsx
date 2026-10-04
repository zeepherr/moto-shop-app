"use client";

import React from "react";
import { PosWorkspace } from "./PosWorkspace";
import { PosCart } from "./PosCart";

interface PosPageClientProps {
  categories: Array<{ id: number; name: string }>;
  products: Array<any>;
  services: Array<any>;
  productDiscountRate: number;
}

export const PosPageClient: React.FC<PosPageClientProps> = ({
  categories,
  products,
  services,
  productDiscountRate,
}) => {
  return (
    <div className="mx-auto w-full max-w-[1800px] sm:px-2.5 pr-1.5 lg:h-[calc(100vh-5.5rem)] lg:min-h-0 lg:p-4">
      <div className="grid grid-cols-1 gap-3 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-4">
        <PosWorkspace
          categories={categories}
          products={products}
          services={services}
        />
        <PosCart productDiscountRate={productDiscountRate} />
      </div>
    </div>
  );
};
