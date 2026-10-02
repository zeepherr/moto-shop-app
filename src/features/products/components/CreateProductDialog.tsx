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
import type { ProductCategoryDTO } from "@/features/categories/types";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ProductFormData) => void;
  isPending?: boolean;
  categories: ProductCategoryDTO[];
}

export const CreateProductDialog: React.FC<CreateProductDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
  categories,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-3xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Add product</DialogTitle>
          <DialogDescription>Add a new product to your inventory.</DialogDescription>
        </DialogHeader>

        <ProductForm
          categories={categories}
          submitLabel="Add Product"
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
};
