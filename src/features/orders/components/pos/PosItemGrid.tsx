"use client";

import React, { useMemo } from "react";
import { PackageOpen } from "lucide-react";
import { PosProductCard } from "./PosProductCard";
import { PosServiceCard } from "./PosServiceCard";
import type { PosProduct } from "./PosProductCard";
import type { PosService } from "./PosServiceCard";

interface PosItemGridProps {
  mode: "PRODUCT" | "SERVICE";
  searchTerm: string;
  selectedCategory: string;
  products: PosProduct[];
  services: PosService[];
  isLoading?: boolean;
}

export const PosItemGrid: React.FC<PosItemGridProps> = ({
  mode,
  searchTerm,
  selectedCategory,
  products = [],
  services = [],
  isLoading = false,
}) => {
  const isProductMode = mode === "PRODUCT";

  const search = searchTerm.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search);
      const matchesCategory =
        selectedCategory === "all" ||
        String(product.productCategoryId) === String(selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);
  const filteredServices = useMemo(
    () => services.filter((service) => !search || service.name.toLowerCase().includes(search)),
    [services, search],
  );
  const filteredCount = isProductMode ? filteredProducts.length : filteredServices.length;

  if (isLoading) {
    return (
      <PosItemGridShell>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </PosItemGridShell>
    );
  }

  if (!filteredCount) {
    return (
      <PosItemGridShell>
        <div className="flex h-full min-h-64 flex-col items-center justify-center gap-2 text-center">
          <PackageOpen className="size-8 text-muted-foreground" />
          <p className="font-medium text-foreground">
            No {isProductMode ? "products" : "services"} found
          </p>
          <p className="text-sm text-muted-foreground">
            Try changing your search or filter.
          </p>
        </div>
      </PosItemGridShell>
    );
  }

  return (
    <PosItemGridShell>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {isProductMode
          ? filteredProducts.map((product) => (
              <PosProductCard key={product.id} product={product} />
            ))
          : filteredServices.map((service) => (
              <PosServiceCard key={service.id} service={service} />
            ))}
      </div>
    </PosItemGridShell>
  );
};

function PosItemGridShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-72 scrollbar-none lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:rounded-2xl lg:border lg:border-border/70 lg:bg-card lg:p-2">
      {children}
    </section>
  );
}
