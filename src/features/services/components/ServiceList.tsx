"use client";

import React, { useState, useTransition } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ServiceModal } from "./ServiceModal";
import { updateServiceAction, deleteServiceAction } from "../actions/motoService.actions";
import type { MotoServiceDTO } from "../types";

export const ServiceList: React.FC<{ initialServices: MotoServiceDTO[] }> = ({ initialServices }) => {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<MotoServiceDTO | null>(null);
  const [, startTransition] = useTransition();

  const filtered = initialServices.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase())),
  );

  const handleToggleActive = (service: MotoServiceDTO) => {
    startTransition(async () => {
      await updateServiceAction(service.id, { isActive: !service.isActive });
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    startTransition(async () => {
      const res = await deleteServiceAction(id);
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
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Button
          onClick={() => {
            setEditingService(null);
            setModalOpen(true);
          }}
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Service</span>
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No services found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((serv) => (
                <TableRow key={serv.id}>
                  <TableCell className="font-medium text-foreground">{serv.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-xs truncate">
                    {serv.description || "—"}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    ฿{Number(serv.price).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(serv)}
                      className={`px-2 py-0.5 text-xs font-semibold rounded-md border cursor-pointer transition-colors ${
                        serv.isActive
                          ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                      }`}
                    >
                      {serv.isActive ? "Active" : "Inactive"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingService(serv);
                        setModalOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(serv.id)}
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

      <ServiceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        service={editingService}
      />
    </div>
  );
};
