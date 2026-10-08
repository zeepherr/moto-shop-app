"use client";

import React, { useEffect, useState } from "react";
import { PosSearch } from "./PosSearch";
import { PosBrowseControls } from "./PosBrowseControls";
import { PosItemGrid } from "./PosItemGrid";
import type { PosProduct } from "./PosProductCard";
import type { PosService } from "./PosServiceCard";
import { findPosProductBySkuAction, searchPosProductsAction } from "@/features/products/actions/product.actions";

interface PosWorkspaceProps {
  categories: Array<{ id: number; name: string }>;
  products: PosProduct[];
  services: PosService[];
  onProductAdded?: (imageElement: HTMLImageElement | null) => void;
  onServiceAdded?: () => void;
}

export const PosWorkspace: React.FC<PosWorkspaceProps> = ({
  categories = [],
  products = [],
  services = [],
  onProductAdded,
  onServiceAdded,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleProducts, setVisibleProducts] = useState(products);
  const [mode, setMode] = useState<"PRODUCT" | "SERVICE">("PRODUCT");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (mode !== "PRODUCT") {
        setVisibleProducts(products);
        return;
      }
      if (!searchTerm.trim() && selectedCategory === "all") {
        setVisibleProducts(products);
        return;
      }
      const result = await searchPosProductsAction({
        search: searchTerm,
        categoryId: selectedCategory === "all" ? undefined : Number(selectedCategory),
      });
      if (!cancelled && result.success) setVisibleProducts(result.data);
    }, searchTerm.trim() || selectedCategory !== "all" ? 250 : 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [products, searchTerm, selectedCategory, mode]);

  return (
    <section aria-label="Product and service catalog" className="mt-0 flex min-w-0 flex-col gap-3 sm:mt-4 lg:mt-0 lg:h-full lg:min-h-0 lg:gap-4 2xl:mt-4">
      <PosSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        products={visibleProducts}
        onSkuLookup={async (sku) => {
          const result = await findPosProductBySkuAction(sku);
          return result.success ? result.data : null;
        }}
      />

      <PosBrowseControls
        mode={mode}
        onModeChange={setMode}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <PosItemGrid
        mode={mode}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        products={visibleProducts}
        services={services}
        onProductAdded={onProductAdded}
        onServiceAdded={onServiceAdded}
      />
    </section>
  );
};
