import React from "react";
import type { Metadata } from "next";
import { findAllProducts } from "@/features/products/services/product.service";
import { findAllCategories } from "@/features/categories/services/category.service";
import { getR2PublicUrl } from "@/features/products/services/r2.service";
import { ProductList } from "@/features/products/components/ProductList";

export const metadata: Metadata = {
  title: "Products & Inventory - HrungMoto",
  description: "Manage products, inventory stock, and pricing",
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [rawProducts, rawCategories] = await Promise.all([
    findAllProducts(),
    findAllCategories({ isActive: true }),
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

  const categories = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    _count: c._count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Products & Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Manage product catalog, pricing, SKU codes, and Cloudflare R2 images
        </p>
      </div>

      <ProductList initialProducts={products} categories={categories as any} />
    </div>
  );
}
