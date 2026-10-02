"use client";

import React, { useState, useTransition } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryModal } from "./CategoryModal";
import { updateCategoryAction, deleteCategoryAction } from "../actions/category.actions";
import type { ProductCategoryDTO } from "../types";

export const CategoryList: React.FC<{ initialCategories: ProductCategoryDTO[] }> = ({
  initialCategories,
}) => {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategoryDTO | null>(null);
  const [, startTransition] = useTransition();

  const filtered = initialCategories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggleActive = (category: ProductCategoryDTO) => {
    startTransition(async () => {
      await updateCategoryAction(category.id, { isActive: !category.isActive });
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    startTransition(async () => {
      const res = await deleteCategoryAction(id);
      if (!res.success) alert(res.error);
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium text-foreground">{cat.name}</TableCell>
                  <TableCell>{cat._count?.products ?? 0} items</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(cat)}
                      className={`px-2 py-0.5 text-xs font-semibold rounded-md border cursor-pointer transition-colors ${
                        cat.isActive
                          ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCategory(cat);
                        setModalOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        category={editingCategory}
      />
    </div>
  );
};
