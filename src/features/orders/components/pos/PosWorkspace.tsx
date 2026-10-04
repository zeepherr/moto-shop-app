"use client";

import React, { useState } from "react";
import { PosSearch } from "./PosSearch";
import { PosBrowseControls } from "./PosBrowseControls";
import { PosItemGrid } from "./PosItemGrid";
import type { PosProduct } from "./PosProductCard";
import type { PosService } from "./PosServiceCard";

interface PosWorkspaceProps {
  categories: Array<{ id: number; name: string }>;
  products: PosProduct[];
  services: PosService[];
}

export const PosWorkspace: React.FC<PosWorkspaceProps> = ({
  categories = [],
  products = [],
  services = [],
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mode, setMode] = useState<"PRODUCT" | "SERVICE">("PRODUCT");
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <section aria-label="Product and service catalog" className="mt-0 flex min-w-0 flex-col gap-3 sm:mt-4 lg:h-full lg:min-h-0 lg:gap-4">
      <PosSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        products={products}
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
        products={products}
        services={services}
      />
    </section>
  );
};
