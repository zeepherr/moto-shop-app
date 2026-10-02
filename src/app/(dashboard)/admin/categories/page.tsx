import React from "react";
import type { Metadata } from "next";
import { findAllCategories } from "@/features/categories/services/category.service";
import { CategoryList } from "@/features/categories/components/CategoryList";

export const metadata: Metadata = {
  title: "Product Categories - HrungMoto",
  description: "Manage product categories catalog",
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const rawCategories = await findAllCategories();

  const categories = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    _count: c._count,
  }));

  return <CategoryList initialCategories={categories} />;
}
