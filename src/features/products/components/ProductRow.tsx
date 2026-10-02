"use client";

import React from "react";
import { Package } from "lucide-react";
import { ProductActions } from "./ProductActions";
import { getR2PublicUrl } from "../services/r2.service";
import type { ProductDTO } from "../types";

interface ProductRowProps {
  product: ProductDTO;
  onEdit: (product: ProductDTO) => void;
  onStatusChange: (product: ProductDTO) => void;
  onDelete: (product: ProductDTO) => void;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  product,
  onEdit,
  onStatusChange,
  onDelete,
}) => {
  const imageUrl = product.imageUrl || (product.imageKey ? getR2PublicUrl(product.imageKey) : null);

  return (
    <tr className="border-b border-border/50 transition-colors last:border-b-0 hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="flex min-w-60 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted/30">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="size-full object-cover"
                loading="lazy"
              />
            ) : (
              <Package className="size-5 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate font-medium text-foreground text-sm">
              {product.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground font-mono">
              {product.sku}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="max-w-72">
          <p className="truncate text-sm font-medium text-foreground">
            {product.productCategory?.name ?? "Unknown category"}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {product.description || "No description"}
          </p>
        </div>
      </td>

      <td className="whitespace-nowrap px-4 py-3">
        <span className="font-semibold text-sm text-foreground">
          ฿{Number(product.sellingPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </td>

      <td className="whitespace-nowrap px-4 py-3">
        <StockStatus quantity={product.stockQuantity} unit={product.unit} />
      </td>

      <td className="whitespace-nowrap px-4 py-3">
        <ProductStatus isActive={product.isActive} />
      </td>

      <td className="w-16 px-4 py-3 text-right">
        <ProductActions
          product={product}
          onDelete={onDelete}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
        />
      </td>
    </tr>
  );
};

function ProductStatus({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={
        isActive
          ? "flex items-center gap-1.5 text-xs font-medium text-emerald-500"
          : "flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      }
    >
      <span
        className={
          isActive
            ? "size-1.5 rounded-full bg-emerald-500"
            : "size-1.5 rounded-full bg-muted-foreground"
        }
      />
      {isActive ? "Active" : "Inactive"}
    </div>
  );
}

function StockStatus({ quantity, unit }: { quantity: number; unit: string }) {
  const isOutOfStock = quantity === 0;
  const isLowStock = quantity > 0 && quantity <= 5;

  return (
    <div>
      <p className="font-medium text-sm text-foreground">
        {quantity} {unit}
      </p>
      <p
        className={
          isOutOfStock
            ? "text-xs text-destructive font-medium"
            : isLowStock
              ? "text-xs text-amber-500 font-medium"
              : "text-xs text-emerald-500 font-medium"
        }
      >
        {isOutOfStock ? "Out of stock" : isLowStock ? "Low stock" : "In stock"}
      </p>
    </div>
  );
}
