"use client";

import React from "react";
import { FolderTree, Package } from "lucide-react";
import { StatusBadge } from "@/components/management/StatusBadge";
import { RowActions } from "@/components/management/RowActions";
import type { ProductCategoryDTO } from "../types";

interface CategoryTableProps {
  categories: ProductCategoryDTO[];
  onEdit: (category: ProductCategoryDTO) => void;
  onToggleStatus: (category: ProductCategoryDTO) => void;
  onDelete: (category: ProductCategoryDTO) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/60">
          <FolderTree className="size-6" />
        </div>
        <p className="font-semibold text-foreground text-sm">No product categories found</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Try clearing search filters or add a new category to your shop catalog.
        </p>
      </div>
    );
  }

  return (
    <table className="w-full min-w-[650px] text-sm">
      <thead>
        <tr className="border-b border-border/60 bg-muted/30">
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Category Name
          </th>
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Assigned Products
          </th>
          <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Status
          </th>
          <th className="w-16 px-4 py-3 text-right font-medium text-muted-foreground">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-border/40">
        {categories.map((c) => (
          <tr key={c.id} className="group hover:bg-muted/30 transition-colors">
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex size-9.5 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/50 font-bold text-xs text-foreground uppercase tracking-wider shadow-2xs group-hover:border-primary/40 group-hover:bg-primary/5 transition-colors">
                  {c.name.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Product classification
                  </p>
                </div>
              </div>
            </td>

            <td className="px-4 py-3.5">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/50 px-2.5 py-1 rounded-lg border border-border/50">
                <Package className="size-3.5 text-muted-foreground/70" />
                <span>
                  {c._count?.products ?? 0}{" "}
                  {c._count?.products === 1 ? "product" : "products"}
                </span>
              </span>
            </td>

            <td className="px-4 py-3.5">
              <StatusBadge isActive={c.isActive} />
            </td>

            <td className="px-4 py-3.5 text-right">
              <RowActions
                isActive={c.isActive}
                onEdit={() => onEdit(c)}
                onStatusChange={() => onToggleStatus(c)}
                onDelete={() => onDelete(c)}
                label="category"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
