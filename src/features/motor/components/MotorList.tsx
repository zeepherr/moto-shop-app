"use client";

import React, { useState, useTransition } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MotorModal } from "./MotorModal";
import { updateMotorAction, deleteMotorAction } from "../actions/motor.actions";
import type { MotorDTO, MotorBrandDTO } from "../types";

export const MotorList: React.FC<{ initialMotors: MotorDTO[]; brands: MotorBrandDTO[] }> = ({
  initialMotors,
  brands,
}) => {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMotor, setEditingMotor] = useState<MotorDTO | null>(null);
  const [, startTransition] = useTransition();

  const filtered = initialMotors.filter(
    (m) =>
      m.model.toLowerCase().includes(search.toLowerCase()) ||
      m.motorBrand?.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggleActive = (motor: MotorDTO) => {
    startTransition(async () => {
      await updateMotorAction(motor.id, { isActive: !motor.isActive });
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this motorcycle model?")) return;
    startTransition(async () => {
      const res = await deleteMotorAction(id);
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
            placeholder="Search models or brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Button
          onClick={() => {
            setEditingMotor(null);
            setModalOpen(true);
          }}
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Motorcycle Model</span>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Model Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No motorcycle models found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-semibold text-primary">{m.motorBrand?.name}</TableCell>
                  <TableCell className="font-medium text-foreground">{m.model}</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 text-xs rounded-md bg-secondary text-secondary-foreground border border-border font-mono">
                      {m.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(m)}
                      className={`px-2 py-0.5 text-xs font-semibold rounded-md border cursor-pointer transition-colors ${
                        m.isActive
                          ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                      }`}
                    >
                      {m.isActive ? "Active" : "Inactive"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingMotor(m);
                        setModalOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(m.id)}
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

      <MotorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        motor={editingMotor}
        brands={brands}
      />
    </div>
  );
};
