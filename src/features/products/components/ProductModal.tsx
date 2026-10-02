"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProductAction, updateProductAction, getPresignedUploadUrlAction } from "../actions/product.actions";
import { getR2PublicUrl } from "../services/r2.service";
import type { ProductDTO } from "../types";
import type { ProductCategoryDTO } from "@/features/categories/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductDTO | null;
  categories: ProductCategoryDTO[];
}

export const ProductModal: React.FC<Props> = ({ open, onOpenChange, product, categories }) => {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    unit: "Piece",
    costPrice: "",
    sellingPrice: "",
    stockQuantity: "0",
    productCategoryId: "",
    description: "",
    imageKey: "" as string | null,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        unit: product.unit,
        costPrice: product.costPrice.toString(),
        sellingPrice: product.sellingPrice.toString(),
        stockQuantity: product.stockQuantity.toString(),
        productCategoryId: product.productCategoryId.toString(),
        description: product.description || "",
        imageKey: product.imageKey,
      });
    } else {
      setForm({
        name: "",
        sku: "",
        unit: "Piece",
        costPrice: "",
        sellingPrice: "",
        stockQuantity: "0",
        productCategoryId: categories[0]?.id?.toString() || "",
        description: "",
        imageKey: null,
      });
    }
    setError(null);
  }, [product, categories, open]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const urlRes = await getPresignedUploadUrlAction({ fileName: file.name, contentType: file.type });
      if (!urlRes.success || !urlRes.data) throw new Error(urlRes.error || "Failed to get upload URL");

      const uploadRes = await fetch(urlRes.data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Direct upload to Cloudflare R2 failed");
      setForm((prev) => ({ ...prev, imageKey: urlRes.data?.key || null }));
    } catch (err: unknown) {
      setError((err as Error).message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const payload = {
        name: form.name,
        sku: form.sku || undefined,
        unit: form.unit,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        stockQuantity: Number(form.stockQuantity),
        productCategoryId: Number(form.productCategoryId),
        description: form.description || undefined,
        imageKey: form.imageKey || undefined,
      };

      const res = product
        ? await updateProductAction(product.id, payload)
        : await createProductAction(payload);

      if (!res.success) {
        setError(res.error || "Failed to save product");
        return;
      }

      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogDescription>
          {product ? "Update product specifications and inventory" : "Register a new product in your shop inventory"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto px-1">
        {error && <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive">{error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="prod-name">Product Name</Label>
            <Input id="prod-name" required placeholder="e.g. Synthetic Oil 10W-40" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={isPending} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prod-cat">Category</Label>
            <select id="prod-cat" className="flex h-10 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring" value={form.productCategoryId} onChange={(e) => setForm({ ...form, productCategoryId: e.target.value })} disabled={isPending}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="prod-sku">SKU (Auto if blank)</Label>
            <Input id="prod-sku" placeholder="AUTO-GEN" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} disabled={isPending} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prod-unit">Unit</Label>
            <Input id="prod-unit" required placeholder="Piece / Bottle" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} disabled={isPending} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prod-stock">Stock Quantity</Label>
            <Input id="prod-stock" type="number" min="0" required value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} disabled={isPending} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="prod-cost">Cost Price (THB)</Label>
            <Input id="prod-cost" type="number" min="0" step="0.01" required placeholder="0.00" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} disabled={isPending} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prod-selling">Selling Price (THB)</Label>
            <Input id="prod-selling" type="number" min="0" step="0.01" required placeholder="0.00" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} disabled={isPending} />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-1">
          <Label>Product Photo (Cloudflare R2)</Label>
          <div className="flex items-center gap-3">
            {form.imageKey ? (
              <div className="relative h-16 w-16 rounded-xl border border-border overflow-hidden bg-muted">
                <Image src={getR2PublicUrl(form.imageKey)} alt="Preview" fill className="object-cover" />
                <button type="button" onClick={() => setForm({ ...form, imageKey: null })} className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-input rounded-xl cursor-pointer hover:bg-muted/50 text-xs text-muted-foreground">
                <Upload className="h-4 w-4" />
                <span>{uploadingImage ? "Uploading to R2..." : "Upload Photo"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={uploadingImage || isPending} />
              </label>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending || uploadingImage}>Cancel</Button>
          <Button type="submit" disabled={isPending || uploadingImage}>{isPending ? "Saving..." : product ? "Update Product" : "Create Product"}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
};
