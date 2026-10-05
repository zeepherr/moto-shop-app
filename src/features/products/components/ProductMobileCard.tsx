"use client";

import { Package } from "lucide-react";
import Image from "next/image";
import { StatusBadge } from "@/components/management/StatusBadge";
import { ProductActions } from "./ProductActions";
import { getR2PublicUrl } from "../services/r2.service";
import type { ProductDTO } from "../types";

interface ProductMobileCardProps {
  product: ProductDTO;
  onEdit: (product: ProductDTO) => void;
  onStatusChange: (product: ProductDTO) => void;
  onDelete: (product: ProductDTO) => void;
}

export function ProductMobileCard({ product, onEdit, onStatusChange, onDelete }: ProductMobileCardProps) {
  const imageUrl = product.imageUrl || (product.imageKey ? getR2PublicUrl(product.imageKey) : null);
  const stockState = product.stockQuantity === 0
    ? "Out of stock"
    : product.stockQuantity <= 5
      ? "Low stock"
      : "In stock";
  const stockTone = product.stockQuantity === 0
    ? "text-destructive"
    : product.stockQuantity <= 5
      ? "text-amber-600 dark:text-amber-400"
      : "text-emerald-600 dark:text-emerald-400";
  return (
    <article className="rounded-xl border border-border/70 bg-background p-3.5">
      <header className="flex min-w-0 items-start gap-3">
        <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/70 bg-muted/40">
          {imageUrl ? <Image src={imageUrl} alt={product.name} fill unoptimized sizes="48px" className="object-cover" /> : <Package className="size-5 text-muted-foreground" />}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{product.sku}</p>
        </div>
        <div className="-mr-1 -mt-1 [&>button]:size-11 [&>button]:rounded-xl">
          <ProductActions product={product} onEdit={onEdit} onStatusChange={onStatusChange} onDelete={onDelete} />
        </div>
      </header>
      {product.description && <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">{product.description}</p>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
        <span className="max-w-[55%] truncate text-xs text-muted-foreground">{product.productCategory?.name ?? "Unknown category"}</span>
        <StatusBadge isActive={product.isActive} />
      </div>
      <div className="mt-3 grid grid-cols-2 divide-x divide-border/60 border-t border-border/60 pt-3">
        <div className="min-w-0 pr-3">
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="mt-1 truncate text-sm font-semibold tabular-nums text-foreground">฿{Number(product.sellingPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="min-w-0 pl-3">
          <p className="text-xs text-muted-foreground">Stock</p>
          <p className="mt-1 truncate text-sm font-semibold tabular-nums text-foreground">{product.stockQuantity} {product.unit}</p>
          <p className={`text-xs font-medium ${stockTone}`}>{stockState}</p>
        </div>
      </div>
    </article>
  );
}
