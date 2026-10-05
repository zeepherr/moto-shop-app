"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ProductImageField } from "./ProductImageField";
import type { ProductCategoryDTO } from "@/features/categories/types";

const PRODUCT_UNITS = [
  { value: "piece", label: "Piece" },
  { value: "pair", label: "Pair" },
  { value: "set", label: "Set" },
  { value: "bottle", label: "Bottle" },
  { value: "liter", label: "Liter" },
];

export interface ProductFormData {
  productCategoryId: number;
  sku: string;
  name: string;
  description: string;
  costPrice: number | string;
  sellingPrice: number | string;
  stockQuantity: number | string;
  unit: string;
  imageUrl?: string | null;
  image?: File | null;
}

type ProductFormState = Omit<ProductFormData, "image" | "imageUrl">;

function getInitialFormState(
  values: Partial<ProductFormData>,
  fallbackCategoryId: number,
): ProductFormState {
  return {
    productCategoryId: values.productCategoryId ?? fallbackCategoryId,
    sku: values.sku ?? "",
    name: values.name ?? "",
    description: values.description ?? "",
    costPrice: values.costPrice ?? "",
    sellingPrice: values.sellingPrice ?? "",
    stockQuantity: values.stockQuantity ?? "",
    unit: values.unit ?? "piece",
  };
}

interface ProductFormProps {
  categories: ProductCategoryDTO[];
  defaultValues?: Partial<ProductFormData>;
  submitLabel?: string;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  categories,
  defaultValues = {},
  submitLabel = "Save",
  onSubmit,
  onCancel,
  isPending = false,
}) => {
  const fallbackCategoryId = categories[0]?.id ?? 0;
  const [form, setForm] = useState<ProductFormState>(() =>
    getInitialFormState(defaultValues, fallbackCategoryId),
  );

  const [newImage, setNewImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!form.sellingPrice) {
      setError("Selling price is required");
      return;
    }

    setError(null);
    onSubmit({
      ...form,
      costPrice: Number(form.costPrice) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      stockQuantity: Number(form.stockQuantity) || 0,
      productCategoryId: Number(form.productCategoryId),
      image: newImage,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none max-h-[75vh] px-1 space-y-5 py-2">
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="grid items-start gap-5 sm:grid-cols-[220px_minmax(0,1fr)]">
          <ProductImageField
            currentImageUrl={defaultValues.imageUrl ?? null}
            file={newImage}
            onFileChange={setNewImage}
            onCancelFile={() => setNewImage(null)}
            disabled={isPending}
          />

          <div className="space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="prod-name">Product name</Label>
              <Input
                id="prod-name"
                placeholder="e.g. Michelin City Extra"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="prod-sku">SKU</Label>
              <Input
                id="prod-sku"
                placeholder="e.g. TIRE-001 (auto if empty)"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                disabled={isPending}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="prod-cat">Category</Label>
              <Select
                id="prod-cat"
                value={String(form.productCategoryId)}
                onValueChange={(value) => setForm({ ...form, productCategoryId: Number(value) })}
                disabled={isPending}
                className="flex h-10 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                options={categories.map((category) => ({ value: String(category.id), label: category.name }))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="prod-desc">
            Description <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <textarea
            id="prod-desc"
            rows={3}
            placeholder="Add a short product description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            disabled={isPending}
            className="flex w-full rounded-xl border border-input bg-card p-3 text-sm text-foreground shadow-xs outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="prod-cost">Cost price (฿)</Label>
            <Input
              id="prod-cost"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="prod-sell">Selling price (฿)</Label>
            <Input
              id="prod-sell"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.sellingPrice}
              onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
              disabled={isPending}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="prod-stock">Stock quantity</Label>
            <Input
              id="prod-stock"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="prod-unit">Unit</Label>
            <Select
              id="prod-unit"
              value={form.unit}
              onValueChange={(unit) => setForm({ ...form, unit })}
              disabled={isPending}
              className="flex h-10 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-xs outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              options={PRODUCT_UNITS}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex shrink-0 justify-end gap-2 border-t border-border/60 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending} className="cursor-pointer">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="cursor-pointer">
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};
