import React from "react";
import type { Metadata } from "next";
import { findAllProducts } from "@/features/products/services/product.service";
import { findAllCategories } from "@/features/categories/services/category.service";
import { ProductList } from "@/features/products/components/ProductList";

export const metadata: Metadata = {
  title: "Products & Inventory - HrungMoto",
  description: "Manage products, inventory stock, and pricing",
};

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    findAllProducts(),
    findAllCategories({ isActive: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Products & Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Manage product catalog, pricing, SKU codes, and Cloudflare R2 images
        </p>
      </div>

      <ProductList initialProducts={products} categories={categories} />
    </div>
  );
}
