"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Search, Edit2, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductModal } from "./ProductModal";
import { updateProductAction, deleteProductAction } from "../actions/product.actions";
import { getR2PublicUrl } from "../services/r2.service";
import type { ProductDTO } from "../types";
import type { ProductCategoryDTO } from "@/features/categories/types";

export const ProductList: React.FC<{ initialProducts: ProductDTO[]; categories: ProductCategoryDTO[] }> = ({
  initialProducts,
  categories,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [, startTransition] = useTransition();

  const filtered = initialProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === "all" || p.productCategoryId === Number(selectedCat);
    return matchesSearch && matchesCat;
  });

  const handleToggleActive = (prod: ProductDTO) => {
    startTransition(async () => {
      await updateProductAction(prod.id, { isActive: !prod.isActive });
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    startTransition(async () => {
      const res = await deleteProductAction(id);
      if (!res.success) alert(res.error);
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
          </div>
          <select
            className="h-10 rounded-xl border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <Button onClick={() => { setEditingProduct(null); setModalOpen(true); }} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price (THB)</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No products found.</TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="h-9 w-9 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden relative">
                      {p.imageKey ? (
                        <img src={getR2PublicUrl(p.imageKey)} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                  <TableCell><span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{p.sku}</span></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.productCategory?.name}</TableCell>
                  <TableCell className="font-semibold text-foreground">฿{Number(p.sellingPrice).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`font-semibold text-xs ${p.stockQuantity <= 5 ? "text-destructive" : "text-foreground"}`}>
                      {p.stockQuantity} {p.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(p)}
                      className={`px-2 py-0.5 text-xs font-semibold rounded-md border cursor-pointer transition-colors ${
                        p.isActive
                          ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                      }`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingProduct(p); setModalOpen(true); }}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductModal open={modalOpen} onOpenChange={setModalOpen} product={editingProduct} categories={categories} />
    </div>
  );
};
