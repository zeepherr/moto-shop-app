"use client";

import React, { useState, useMemo, useTransition, useEffect, useRef } from "react";
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
  searchProductsAction,
} from "../actions/product.actions";
import type { ProductDTO } from "../types";
import type { ProductCategoryDTO } from "@/features/categories/types";
import type { ProductFormData } from "./ProductForm";
import { ProductDiscountSetting } from "./ProductDiscountSetting";
import { Select } from "@/components/ui/select";

interface ProductPageClientProps {
  initialProducts: ProductDTO[];
  initialTotalProducts: number;
  productStats: { total: number; activeCount: number; inactiveCount: number; inStock: number; lowStock: number; outOfStock: number; inventoryValue: number };
  categories: ProductCategoryDTO[];
  initialProductDiscountRate: number;
}

type ProductSortKey = "name" | "sellingPrice" | "stockQuantity";

export const ProductPageClient: React.FC<ProductPageClientProps> = ({
  initialProducts,
  initialTotalProducts,
  productStats,
  categories,
  initialProductDiscountRate,
}) => {
  const [products, setProducts] = useState(initialProducts);
  const [totalProducts, setTotalProducts] = useState(initialTotalProducts);
  const [filteredTotal, setFilteredTotal] = useState(initialTotalProducts);
  const [activeCount, setActiveCount] = useState(productStats.activeCount);
  const [inactiveCount, setInactiveCount] = useState(productStats.inactiveCount);
  const [page, setPage] = useState(0);
  const [previousInitialProducts, setPreviousInitialProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<{ key: ProductSortKey; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc",
  });
  const defaultSearchKey = JSON.stringify({ search: "", category: "all", status: "all", page: 0, sort: { key: "name", direction: "asc" } });
  const searchKey = JSON.stringify({ search, category: selectedCategory, status, page, sort });
  const lastRequestedSearchKey = useRef(defaultSearchKey);
  const previousSearchProducts = useRef(initialProducts);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [statusProduct, setStatusProduct] = useState<ProductDTO | null>(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductDTO | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  if (initialProducts !== previousInitialProducts) {
    setPreviousInitialProducts(initialProducts);
    setProducts(initialProducts);
    setTotalProducts(initialTotalProducts);
    setFilteredTotal(initialTotalProducts);
    setActiveCount(productStats.activeCount);
    setInactiveCount(productStats.inactiveCount);
    setPage(0);
  }

  useEffect(() => {
    if (previousSearchProducts.current !== initialProducts) {
      previousSearchProducts.current = initialProducts;
      lastRequestedSearchKey.current = defaultSearchKey;
    }
    if (lastRequestedSearchKey.current === searchKey) return;

    const controller = { cancelled: false };
    const timer = window.setTimeout(async () => {
      if (lastRequestedSearchKey.current === searchKey) return;
      lastRequestedSearchKey.current = searchKey;
      const result = await searchProductsAction({
        search,
        categoryId: selectedCategory === "all" ? undefined : Number(selectedCategory),
        status: status as "all" | "active" | "inactive",
        skip: page * 50,
        sortBy: sort.key,
        sortDirection: sort.direction,
      });
      if (!controller.cancelled && result.success) {
        setProducts(result.data);
        setFilteredTotal(result.total);
        setActiveCount(result.activeCount);
        setInactiveCount(result.inactiveCount);
      }
    }, search || selectedCategory !== "all" || status !== "all" || page > 0 ? 250 : 0);
    return () => { controller.cancelled = true; window.clearTimeout(timer); };
  }, [search, selectedCategory, status, page, sort.key, sort.direction, initialProducts, defaultSearchKey, searchKey]);

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

    return filtered.sort((a, b) => {
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
      all: totalProducts,
      active: activeCount,
      inactive: inactiveCount,
    }),
    [totalProducts, activeCount, inactiveCount]
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
    <ManagementLayout className="!space-y-4 sm:!space-y-6">
      <PageHeader
        compactOnMobile
        title="Products & Inventory"
        description="Manage stock inventory, pricing, catalog categories, and SKU barcodes"
        count={totalProducts}
        actionLabel="Add Product"
        onAction={() => setCreateOpen(true)}
      />

      <ProductDiscountSetting initialRate={initialProductDiscountRate} />

      <ProductStats products={products} stats={productStats} />

      <DockedTableCard
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(0); }}
        searchPlaceholder="Search product by name, SKU or description..."
        status={status}
        onStatusChange={(value) => { setStatus(value); setPage(0); }}
        statusCounts={counts}
        filterSlot={
          <Select
            value={selectedCategory}
            onValueChange={(value) => { setSelectedCategory(value); setPage(0); }}
            options={[
              { value: "all", label: "All Categories" },
              ...categories.map((category) => ({ value: String(category.id), label: category.name })),
            ]}
            className="h-9.5 rounded-xl border border-input/80 bg-background/50 px-3 text-xs sm:text-sm text-foreground shadow-2xs outline-none focus:ring-1 focus:ring-primary sm:w-44 cursor-pointer"
          />
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
          setPage(0);
        }}
        totalFiltered={filteredProducts.length}
        totalAll={filteredTotal}
        entityName="products"
      >
        <ProductTable
          products={filteredProducts}
          sort={sort}
          onSort={(key: ProductSortKey) =>
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

      {filteredTotal > 50 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Page {page + 1} of {Math.ceil(filteredTotal / 50)}</p>
          <div className="flex gap-2">
            <button type="button" className="min-h-10 rounded-lg border px-3 text-sm disabled:opacity-50" disabled={page === 0 || isPending} onClick={() => setPage((current) => Math.max(0, current - 1))}>Previous</button>
            <button type="button" className="min-h-10 rounded-lg border px-3 text-sm disabled:opacity-50" disabled={(page + 1) * 50 >= filteredTotal || isPending} onClick={() => setPage((current) => current + 1)}>Next</button>
          </div>
        </div>
      )}

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
