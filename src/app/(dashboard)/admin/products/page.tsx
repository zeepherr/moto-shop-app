import React from "react";
import type { Metadata } from "next";
import { findAllProducts, getProductCatalogStats } from "@/features/products/services/product.service";
import { findAllCategories } from "@/features/categories/services/category.service";
import { getR2PublicUrl } from "@/features/products/services/r2.service";
import { ProductPageClient } from "@/features/products/components/ProductPageClient";
import { getProductDiscountRate } from "@/features/products/services/discount-setting.service";
import type { ProductCategoryDTO } from "@/features/categories/types";

export const metadata: Metadata = {
  title: "Products & Inventory - HrungMoto",
  description: "Manage products, inventory stock, and pricing",
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [rawProducts, rawCategories, productDiscountRate, productStats] = await Promise.all([
    findAllProducts({ take: 50, sortBy: "name", sortDirection: "asc" }),
    findAllCategories({ isActive: true }),
    getProductDiscountRate(),
    getProductCatalogStats(),
  ]);

  const products = rawProducts.map((p) => ({
    id: p.id,
    productCategoryId: p.productCategoryId,
    sku: p.sku,
    name: p.name,
    description: p.description,
    costPrice: Number(p.costPrice),
    sellingPrice: Number(p.sellingPrice),
    stockQuantity: p.stockQuantity,
    unit: p.unit,
    imageKey: p.imageKey,
    imageUrl: p.imageKey ? getR2PublicUrl(p.imageKey) : null,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    productCategory: p.productCategory,
  }));

  const categories: ProductCategoryDTO[] = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    _count: c._count,
  }));

  return <ProductPageClient initialProducts={products} initialTotalProducts={productStats.total} productStats={productStats} categories={categories} initialProductDiscountRate={productDiscountRate} />;
}
