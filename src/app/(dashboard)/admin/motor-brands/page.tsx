import React from "react";
import type { Metadata } from "next";
import { findAllBrands } from "@/features/motor/services/motorBrand.service";
import { MotorBrandList } from "@/features/motor/components/MotorBrandList";

export const metadata: Metadata = {
  title: "Motor Brands - HrungMoto",
  description: "Manage motorcycle brands and manufacturers",
};

export const dynamic = "force-dynamic";

export default async function AdminMotorBrandsPage() {
  const rawBrands = await findAllBrands();

  const brands = rawBrands.map((b) => ({
    id: b.id,
    name: b.name,
    isActive: b.isActive,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    _count: b._count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Motorcycle Brands</h1>
        <p className="text-sm text-muted-foreground">
          Manage authorized motorcycle manufacturers supported in your repair shop
        </p>
      </div>

      <MotorBrandList initialBrands={brands} />
    </div>
  );
}
