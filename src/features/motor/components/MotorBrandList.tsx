"use client";

import React, { useState, useTransition } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MotorBrandModal } from "./MotorBrandModal";
import { updateBrandAction, deleteBrandAction } from "../actions/motor.actions";
import type { MotorBrandDTO } from "../types";

export const MotorBrandList: React.FC<{ initialBrands: MotorBrandDTO[] }> = ({ initialBrands }) => {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<MotorBrandDTO | null>(null);
  const [, startTransition] = useTransition();

  const filtered = initialBrands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggleActive = (brand: MotorBrandDTO) => {
    startTransition(async () => {
      await updateBrandAction(brand.id, { isActive: !brand.isActive });
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    startTransition(async () => {
      const res = await deleteBrandAction(id);
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
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Button
          onClick={() => {
            setEditingBrand(null);
            setModalOpen(true);
          }}
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Brand</span>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand Name</TableHead>
              <TableHead>Motor Models</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No brands found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium text-foreground">{b.name}</TableCell>
                  <TableCell>{b._count?.motors ?? 0} models</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(b)}
                      className={`px-2 py-0.5 text-xs font-semibold rounded-md border cursor-pointer transition-colors ${
                        b.isActive
                          ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                      }`}
                    >
                      {b.isActive ? "Active" : "Inactive"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingBrand(b);
                        setModalOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(b.id)}
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

      <MotorBrandModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        brand={editingBrand}
      />
    </div>
  );
};
