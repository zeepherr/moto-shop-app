"use client";

import React, { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { ProductHeader } from "./ProductHeader";
import { ProductGrid } from "./ProductGrid";
import { CreateProductDialog } from "./CreateProductDialog";
import { EditProductDialog } from "./EditProductDialog";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  getPresignedUploadUrlAction,
} from "../actions/product.actions";
import type { ProductDTO } from "../types";
import type { ProductCategoryDTO } from "@/features/categories/types";
import type { ProductFormData } from "./ProductForm";

interface ProductPageClientProps {
  initialProducts: ProductDTO[];
  categories: ProductCategoryDTO[];
}

export const ProductPageClient: React.FC<ProductPageClientProps> = ({
  initialProducts,
  categories,
}) => {
  const [products, setProducts] = useState(initialProducts);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [statusProduct, setStatusProduct] = useState<ProductDTO | null>(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductDTO | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const presigned = await getPresignedUploadUrlAction({
        fileName: file.name,
        contentType: file.type,
      });
      if (!presigned.success || !presigned.data) {
        toast.error(presigned.error || "Failed to get image upload URL");
        return null;
      }
      const res = await fetch(presigned.data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) {
        toast.error("Failed to upload image to storage");
        return null;
      }
      return presigned.data.key;
    } catch {
      toast.error("An error occurred while uploading image");
      return null;
    }
  };

  const handleCreateProduct = (values: ProductFormData) => {
    startTransition(async () => {
      let imageKey: string | null | undefined = undefined;
      if (values.image) {
        imageKey = await uploadImage(values.image);
        if (!imageKey) return;
      }

      const res = await createProductAction({
        name: values.name,
        sku: values.sku || undefined,
        description: values.description || null,
        productCategoryId: values.productCategoryId,
        costPrice: Number(values.costPrice),
        sellingPrice: Number(values.sellingPrice),
        stockQuantity: Number(values.stockQuantity),
        unit: values.unit,
        imageKey: imageKey || undefined,
      });

      if (res.success) {
        toast.success("Product created successfully");
        setCreateOpen(false);
      } else {
        toast.error(res.error || "Failed to create product");
      }
    });
  };

  const handleUpdateProduct = (values: ProductFormData) => {
    if (!editingProduct) return;
    startTransition(async () => {
      let imageKey: string | null | undefined = undefined;
      if (values.image) {
        imageKey = await uploadImage(values.image);
        if (!imageKey) return;
      }

      const res = await updateProductAction(editingProduct.id, {
        name: values.name,
        sku: values.sku || undefined,
        description: values.description || null,
        productCategoryId: values.productCategoryId,
        costPrice: Number(values.costPrice),
        sellingPrice: Number(values.sellingPrice),
        stockQuantity: Number(values.stockQuantity),
        unit: values.unit,
        ...(imageKey ? { imageKey } : {}),
      });

      if (res.success) {
        toast.success("Product updated successfully");
        setEditOpen(false);
        setEditingProduct(null);
      } else {
        toast.error(res.error || "Failed to update product");
      }
    });
  };

  const handleConfirmStatusChange = () => {
    if (!statusProduct) return;
    startTransition(async () => {
      const res = await updateProductAction(statusProduct.id, {
        isActive: !statusProduct.isActive,
      });
      if (res.success) {
        toast.success(`Product ${statusProduct.isActive ? "deactivated" : "activated"}`);
        setStatusConfirmOpen(false);
        setStatusProduct(null);
      } else {
        toast.error(res.error || "Failed to update status");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    startTransition(async () => {
      const res = await deleteProductAction(deletingProduct.id);
      if (res.success) {
        toast.success("Product deleted successfully");
        setDeleteConfirmOpen(false);
        setDeletingProduct(null);
      } else {
        toast.error(res.error || "Failed to delete product");
      }
    });
  };

  return (
    <div className="space-y-4 mt-2 sm:px-2.5 pr-1.5">
      <ProductHeader onAddProduct={() => setCreateOpen(true)} />

      <ProductGrid
        products={products}
        onEdit={(prod) => {
          setEditingProduct(prod);
          setEditOpen(true);
        }}
        onStatusChange={(prod) => {
          setStatusProduct(prod);
          setStatusConfirmOpen(true);
        }}
        onDelete={(prod) => {
          setDeletingProduct(prod);
          setDeleteConfirmOpen(true);
        }}
      />

      <CreateProductDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateProduct}
        isPending={isPending}
        categories={categories}
      />

      <EditProductDialog
        open={editOpen}
        product={editingProduct}
        categories={categories}
        onOpenChange={setEditOpen}
        onSubmit={handleUpdateProduct}
        isPending={isPending}
      />

      <ConfirmActionDialog
        open={statusConfirmOpen}
        onOpenChange={setStatusConfirmOpen}
        title={statusProduct?.isActive ? "Deactivate this product?" : "Activate this product?"}
        description={
          statusProduct?.isActive
            ? `${statusProduct.name} will no longer be available for active use.`
            : `${statusProduct?.name} will become available for use again.`
        }
        confirmLabel={statusProduct?.isActive ? "Deactivate" : "Activate"}
        cancelLabel="Cancel"
        variant={statusProduct?.isActive ? "destructive" : "default"}
        isPending={isPending}
        onConfirm={handleConfirmStatusChange}
      />

      <ConfirmActionDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open && !isPending) setDeletingProduct(null);
        }}
        title="Delete this product?"
        description={
          deletingProduct
            ? `Are you sure you want to permanently delete "${deletingProduct.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
