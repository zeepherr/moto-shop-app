import React from "react";
import type { Metadata } from "next";
import { findAllCategories } from "@/features/categories/services/category.service";
import { CategoryList } from "@/features/categories/components/CategoryList";

export const metadata: Metadata = {
  title: "Product Categories - HrungMoto",
  description: "Manage product categories catalog",
};

export default async function AdminCategoriesPage() {
  const categories = await findAllCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Product Categories</h1>
        <p className="text-sm text-muted-foreground">
          Organize your motorcycle parts and merchandise into clean categories
        </p>
      </div>

      <CategoryList initialCategories={categories} />
    </div>
  );
}
