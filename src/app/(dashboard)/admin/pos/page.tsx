import React from "react";
import { findAllCategories } from "@/features/categories/services/category.service";
import { findAllProducts } from "@/features/products/services/product.service";
import { findAllServices } from "@/features/services/services/motoService.service";
import { getR2PublicUrl } from "@/features/products/services/r2.service";
import { PosPageClient } from "@/features/orders/components/pos/PosPageClient";
import { getProductDiscountRate } from "@/features/products/services/discount-setting.service";

export const dynamic = "force-dynamic";

export default async function AdminPosPage() {
  const [categories, rawProducts, rawServices, productDiscountRate] = await Promise.all([
    findAllCategories({ isActive: true }),
    findAllProducts({ isActive: true }),
    findAllServices({ isActive: true }),
    getProductDiscountRate(),
  ]);

  const products = rawProducts.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    sellingPrice: Number(p.sellingPrice),
    stockQuantity: p.stockQuantity,
    unit: p.unit,
    imageKey: p.imageKey,
    imageUrl: p.imageKey ? getR2PublicUrl(p.imageKey) : null,
    productCategoryId: p.productCategoryId,
    productCategory: p.productCategory,
  }));

  const services = rawServices.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price: Number(s.price),
  }));

  return (
    <PosPageClient
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      products={products}
      services={services}
      productDiscountRate={productDiscountRate}
    />
  );
}
