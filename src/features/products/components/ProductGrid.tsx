"use client";

import React, { useMemo, useState } from "react";
import { ProductFilters } from "./ProductFilters";
import { ProductTable } from "./ProductTable";
import type { ProductDTO } from "../types";

interface ProductGridProps {
  products: ProductDTO[];
  onEdit: (product: ProductDTO) => void;
  onStatusChange: (product: ProductDTO) => void;
  onDelete: (product: ProductDTO) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onEdit,
  onStatusChange,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc",
  });

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = products?.filter((product) => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term);

      const matchesCat =
        selectedCategory === "all" ||
        String(product.productCategoryId) === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && product.isActive) ||
        (selectedStatus === "inactive" && !product.isActive);

      return matchesSearch && matchesCat && matchesStatus;
    });

    return filtered?.sort((a: any, b: any) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];

      if (typeof aVal === "string") {
        const res = aVal.localeCompare(String(bVal));
        return sort.direction === "asc" ? res : -res;
      }

      const res = Number(aVal || 0) - Number(bVal || 0);
      return sort.direction === "asc" ? res : -res;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus, sort]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedStatus !== "all";

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
  };

  const handleSort = (key: string) => {
    setSort((curr) => ({
      key,
      direction: curr.key === key && curr.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="space-y-4">
      <ProductFilters
        products={products}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        hasActiveFilters={hasActiveFilters}
        handleClearFilters={handleClearFilters}
      />

      <ProductTable
        products={filteredProducts}
        sort={sort}
        onSort={handleSort}
        onEdit={onEdit}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    </div>
  );
};
