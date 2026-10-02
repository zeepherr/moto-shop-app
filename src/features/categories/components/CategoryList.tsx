"use client";

import React, { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";
import { DockedTableCard } from "@/components/management/DockedTableCard";
import { ItemDialog } from "@/components/management/ItemDialog";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { CategoryStats } from "./CategoryStats";
import { CategoryTable } from "./CategoryTable";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "../actions/category.actions";
import type { ProductCategoryDTO } from "../types";

export const CategoryList: React.FC<{
  initialCategories: ProductCategoryDTO[];
}> = ({ initialCategories }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategoryDTO | null>(null);
  const [statusCategory, setStatusCategory] = useState<ProductCategoryDTO | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ProductCategoryDTO | null>(null);

  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return initialCategories.filter((c) => {
      const matchesSearch = !term || c.name.toLowerCase().includes(term);
      const matchesStatus =
        status === "all" ||
        (status === "active" && c.isActive) ||
        (status === "inactive" && !c.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [initialCategories, search, status]);

  const counts = useMemo(
    () => ({
      all: initialCategories.length,
      active: initialCategories.filter((c) => c.isActive).length,
      inactive: initialCategories.filter((c) => !c.isActive).length,
    }),
    [initialCategories]
  );

  const handleCreate = (name: string) => {
    startTransition(async () => {
      const res = await createCategoryAction({ name });
      if (res.success) {
        toast.success("Category created successfully");
        setCreateOpen(false);
      } else {
        toast.error(res.error || "Failed to create category");
      }
    });
  };

  const handleUpdate = (name: string) => {
    if (!editingCategory) return;
    startTransition(async () => {
      const res = await updateCategoryAction(editingCategory.id, { name });
      if (res.success) {
        toast.success("Category updated successfully");
        setEditingCategory(null);
      } else {
        toast.error(res.error || "Failed to update category");
      }
    });
  };

  const handleConfirmStatus = () => {
    if (!statusCategory) return;
    startTransition(async () => {
      const res = await updateCategoryAction(statusCategory.id, {
        isActive: !statusCategory.isActive,
      });
      if (res.success) {
        toast.success(
          `Category ${statusCategory.isActive ? "deactivated" : "activated"}`
        );
        setStatusCategory(null);
      } else {
        toast.error(res.error || "Failed to update status");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingCategory) return;
    startTransition(async () => {
      const res = await deleteCategoryAction(deletingCategory.id);
      if (res.success) {
        toast.success("Category deleted successfully");
        setDeletingCategory(null);
      } else {
        toast.error(res.error || "Failed to delete category");
      }
    });
  };

  return (
    <ManagementLayout>
      <PageHeader
        title="Product Categories"
        description="Organize spare parts, consumables, fluids, and accessories catalog"
        count={initialCategories.length}
        actionLabel="Add Category"
        onAction={() => setCreateOpen(true)}
      />

      <CategoryStats categories={initialCategories} />

      <DockedTableCard
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search categories by name..."
        status={status}
        onStatusChange={setStatus}
        statusCounts={counts}
        hasActiveFilters={search.trim() !== "" || status !== "all"}
        onClearFilters={() => {
          setSearch("");
          setStatus("all");
        }}
        totalFiltered={filtered.length}
        totalAll={initialCategories.length}
        entityName="categories"
      >
        <CategoryTable
          categories={filtered}
          onEdit={setEditingCategory}
          onToggleStatus={setStatusCategory}
          onDelete={setDeletingCategory}
        />
      </DockedTableCard>

      <ItemDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add Product Category"
        description="Add a new classification category for inventory items."
        label="Category Name"
        placeholder="e.g. Engine Oil, Brake Pads, Tires, Filters"
        submitLabel="Add Category"
        onSubmit={handleCreate}
        isPending={isPending}
      />

      <ItemDialog
        open={Boolean(editingCategory)}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        title="Edit Product Category"
        description="Update category name and details."
        label="Category Name"
        placeholder="e.g. Engine Oil"
        initialValue={editingCategory?.name || ""}
        submitLabel="Save Changes"
        onSubmit={handleUpdate}
        isPending={isPending}
      />

      <ConfirmActionDialog
        open={Boolean(statusCategory)}
        onOpenChange={(open) => !open && setStatusCategory(null)}
        title={statusCategory?.isActive ? "Deactivate this category?" : "Activate this category?"}
        description={
          statusCategory?.isActive
            ? `Products in "${statusCategory.name}" will remain, but this category will be marked inactive.`
            : `"${statusCategory?.name}" will become active and available for product assignments.`
        }
        confirmLabel={statusCategory?.isActive ? "Deactivate" : "Activate"}
        cancelLabel="Cancel"
        variant={statusCategory?.isActive ? "destructive" : "default"}
        isPending={isPending}
        onConfirm={handleConfirmStatus}
      />

      <ConfirmActionDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title="Delete this category?"
        description={
          deletingCategory
            ? `Are you sure you want to permanently delete "${deletingCategory.name}"? This action cannot be undone.`
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
