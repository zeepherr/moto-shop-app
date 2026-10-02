import React from "react";
import type { Metadata } from "next";
import { findAllBrands } from "@/features/motor/services/motorBrand.service";
import { MotorBrandList } from "@/features/motor/components/MotorBrandList";

export const metadata: Metadata = {
  title: "Motor Brands - HrungMoto",
  description: "Manage motorcycle brands and manufacturers",
};

export default async function AdminMotorBrandsPage() {
  const brands = await findAllBrands();

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
