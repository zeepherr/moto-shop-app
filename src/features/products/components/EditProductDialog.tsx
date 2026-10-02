"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm, type ProductFormData } from "./ProductForm";
import type { ProductDTO } from "../types";
import type { ProductCategoryDTO } from "@/features/categories/types";

interface EditProductDialogProps {
  product: ProductDTO | null;
  categories: ProductCategoryDTO[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ProductFormData) => void;
  isPending?: boolean;
}

export const EditProductDialog: React.FC<EditProductDialogProps> = ({
  product,
  categories,
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
}) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Edit product</DialogTitle>
          <DialogDescription>Update product detail.</DialogDescription>
        </DialogHeader>

        <ProductForm
          key={product.id}
          defaultValues={{
            productCategoryId: product.productCategoryId,
            sku: product.sku || "",
            name: product.name,
            description: product.description || "",
            costPrice: product.costPrice || 0,
            sellingPrice: product.sellingPrice,
            stockQuantity: product.stockQuantity || 0,
            unit: product.unit,
            imageUrl: product.imageUrl || null,
          }}
          categories={categories}
          submitLabel="Edit Product"
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
};
