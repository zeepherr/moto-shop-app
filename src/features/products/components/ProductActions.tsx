"use client";

import { RowActions } from "@/components/management/RowActions";
import type { ProductDTO } from "../types";

interface ProductActionsProps {
  product: ProductDTO;
  onEdit: (product: ProductDTO) => void;
  onStatusChange: (product: ProductDTO) => void;
  onDelete: (product: ProductDTO) => void;
}

export function ProductActions({ product, onEdit, onStatusChange, onDelete }: ProductActionsProps) {
  return (
    <RowActions
      label="product"
      isActive={product.isActive}
      onEdit={() => onEdit(product)}
      onStatusChange={() => onStatusChange(product)}
      onDelete={() => onDelete(product)}
    />
  );
}
