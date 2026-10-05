"use client";

import React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, PackageOpen } from "lucide-react";
import { ProductRow } from "./ProductRow";
import { ProductMobileCard } from "./ProductMobileCard";
import type { ProductDTO } from "../types";

type ProductSortKey = "name" | "sellingPrice" | "stockQuantity";

interface ProductTableProps {
  products: ProductDTO[];
  sort: { key: ProductSortKey; direction: "asc" | "desc" };
  onSort: (key: ProductSortKey) => void;
  onEdit: (product: ProductDTO) => void;
  onStatusChange: (product: ProductDTO) => void;
  onDelete: (product: ProductDTO) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  sort,
  onSort,
  onEdit,
  onStatusChange,
  onDelete,
}) => {
  return (
    <>
    <div className="space-y-2 p-2 md:hidden">
      {products.map((product) => <ProductMobileCard key={product.id} product={product} onEdit={onEdit} onStatusChange={onStatusChange} onDelete={onDelete} />)}
    </div>
    <div className="hidden overflow-x-auto md:block">
    <table className="w-full min-w-[750px] text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <TableHeading label="Product" sortKey="name" sort={sort} onSort={onSort} />
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Category
              </th>
              <TableHeading label="Price" sortKey="sellingPrice" sort={sort} onSort={onSort} />
              <TableHeading label="Stock" sortKey="stockQuantity" sort={sort} onSort={onSort} />
              <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="w-16 px-4 py-3 text-right font-medium text-muted-foreground">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {products?.length ? (
              products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={onEdit}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <PackageOpen className="size-8 text-muted-foreground/60" />
                    <p className="font-medium text-foreground text-sm">No products found</p>
                    <p className="text-xs text-muted-foreground">Try changing your search or filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
    </div>
    </>
  );
};

function TableHeading({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: ProductSortKey;
  sort: { key: ProductSortKey; direction: "asc" | "desc" };
  onSort: (key: ProductSortKey) => void;
}) {
  const isActive = sort.key === sortKey;

  return (
    <th className="px-4 py-3 text-left">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground text-xs uppercase tracking-wider"
      >
        {label}
        {!isActive ? (
          <ArrowUpDown className="size-3" />
        ) : sort.direction === "asc" ? (
          <ArrowUp className="size-3 text-foreground" />
        ) : (
          <ArrowDown className="size-3 text-foreground" />
        )}
      </button>
    </th>
  );
}
