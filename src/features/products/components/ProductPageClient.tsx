"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";
import { DockedTableCard } from "@/components/management/DockedTableCard";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { ProductStats } from "./ProductStats";
import { ProductTable } from "./ProductTable";
import { CreateProductDialog } from "./CreateProductDialog";
import { EditProductDialog } from "./EditProductDialog";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "../actions/product.actions";
import type { ProductDTO } from "../types";
import type { ProductCategoryDTO } from "@/features/categories/types";
import type { ProductFormData } from "./ProductForm";
import { ProductDiscountSetting } from "./ProductDiscountSetting";

interface ProductPageClientProps {
  initialProducts: ProductDTO[];
  categories: ProductCategoryDTO[];
  initialProductDiscountRate: number;
}

export const ProductPageClient: React.FC<ProductPageClientProps> = ({
  initialProducts,
  categories,
  initialProductDiscountRate,
}) => {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc",
  });

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

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term);

      const matchesCat =
        selectedCategory === "all" ||
        String(product.productCategoryId) === selectedCategory;

      const matchesStatus =
        status === "all" ||
        (status === "active" && product.isActive) ||
        (status === "inactive" && !product.isActive);

      return matchesSearch && matchesCat && matchesStatus;
    });

    return filtered.sort((a: any, b: any) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];
      if (typeof aVal === "string") {
        const res = aVal.localeCompare(String(bVal));
        return sort.direction === "asc" ? res : -res;
      }
      const res = Number(aVal || 0) - Number(bVal || 0);
      return sort.direction === "asc" ? res : -res;
    });
  }, [products, search, selectedCategory, status, sort]);

  const counts = useMemo(
    () => ({
      all: products.length,
      active: products.filter((p) => p.isActive).length,
      inactive: products.filter((p) => !p.isActive).length,
    }),
    [products]
  );

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
        data?: { key?: string };
      } | null;

      if (!res.ok || !json?.success || !json.data?.key) {
        toast.error(json?.error || "Failed to upload image to storage");
        return null;
      }
      return json.data.key;
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
        imageKey: imageKey === undefined ? undefined : imageKey,
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
        toast.success(
          `Product ${statusProduct.isActive ? "deactivated" : "activated"}`
        );
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
    <ManagementLayout>
      <PageHeader
        title="Products & Inventory"
        description="Manage stock inventory, pricing, catalog categories, and SKU barcodes"
        count={products.length}
        actionLabel="Add Product"
        onAction={() => setCreateOpen(true)}
      />

      <ProductDiscountSetting initialRate={initialProductDiscountRate} />

      <ProductStats products={products} />

      <DockedTableCard
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search product by name, SKU or description..."
        status={status}
        onStatusChange={setStatus}
        statusCounts={counts}
        filterSlot={
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9.5 rounded-xl border border-input/80 bg-background/50 px-3 text-xs sm:text-sm text-foreground shadow-2xs outline-none focus:ring-1 focus:ring-primary sm:w-44 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        }
        hasActiveFilters={
          search.trim() !== "" ||
          selectedCategory !== "all" ||
          status !== "all"
        }
        onClearFilters={() => {
          setSearch("");
          setSelectedCategory("all");
          setStatus("all");
        }}
        totalFiltered={filteredProducts.length}
        totalAll={products.length}
        entityName="products"
      >
        <ProductTable
          products={filteredProducts}
          sort={sort}
          onSort={(key) =>
            setSort((curr) => ({
              key,
              direction:
                curr.key === key && curr.direction === "asc" ? "desc" : "asc",
            }))
          }
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
      </DockedTableCard>

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
            ? `${statusProduct.name} will no longer be available for sale in the POS.`
            : `${statusProduct?.name} will become available for sale again.`
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
    </ManagementLayout>
  );
};
