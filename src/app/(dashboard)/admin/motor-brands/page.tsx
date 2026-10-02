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

  return <MotorBrandList initialBrands={brands} />;
}
