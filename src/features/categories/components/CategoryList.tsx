"use client";

import React, { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { FolderTree, Package } from "lucide-react";
import { PageHeader } from "@/components/management/PageHeader";
import { FilterToolbar } from "@/components/management/FilterToolbar";
import { StatusBadge } from "@/components/management/StatusBadge";
import { RowActions } from "@/components/management/RowActions";
import { ItemDialog } from "@/components/management/ItemDialog";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "../actions/category.actions";
import type { ProductCategoryDTO } from "../types";

export const CategoryList: React.FC<{ initialCategories: ProductCategoryDTO[] }> = ({
  initialCategories,
}) => {
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
        toast.success(`Category ${statusCategory.isActive ? "deactivated" : "activated"}`);
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
    <div className="space-y-4">
      <PageHeader
        title="Product Categories"
        description="Organize parts, fluids, and accessories into catalog groupings"
        actionLabel="Add Category"
        onAction={() => setCreateOpen(true)}
      />

      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search categories..."
        status={status}
        onStatusChange={setStatus}
        statusCounts={counts}
        hasActiveFilters={search.trim() !== "" || status !== "all"}
        onClearFilters={() => {
          setSearch("");
          setStatus("all");
        }}
      />

      {/* Unified Apple-Styled Table */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Category Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Products Count
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="w-16 px-4 py-3 text-right font-medium text-muted-foreground">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5 py-6">
                      <FolderTree className="size-8 text-muted-foreground/50" />
                      <p className="font-medium text-foreground text-sm">No categories found</p>
                      <p className="text-xs text-muted-foreground">Try clearing filters or add a new category.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/40 font-semibold text-xs text-foreground uppercase">
                          {cat.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{cat.name}</p>
                          <p className="text-xs text-muted-foreground">Product catalog group</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium bg-muted/40 px-2 py-0.5 rounded-md border border-border/40">
                        <Package className="size-3" />
                        {cat._count?.products ?? 0} {cat._count?.products === 1 ? "product" : "products"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge isActive={cat.isActive} />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <RowActions
                        isActive={cat.isActive}
                        onEdit={() => setEditingCategory(cat)}
                        onStatusChange={() => setStatusCategory(cat)}
                        onDelete={() => setDeletingCategory(cat)}
                        label="category"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialogs */}
      <ItemDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Add Category"
        description="Create a new catalog category for organizing products."
        label="Category Name"
        placeholder="e.g. Engine Oil, Brake Pads, Tires"
        submitLabel="Add Category"
        onSubmit={handleCreate}
        isPending={isPending}
      />

      <ItemDialog
        open={Boolean(editingCategory)}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        title="Edit Category"
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
            ? `Products under "${statusCategory.name}" will remain, but the category will be marked inactive.`
            : `"${statusCategory?.name}" will become active and available for product assignment.`
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
    </div>
  );
};
