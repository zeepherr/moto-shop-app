import React from "react";
import type { Metadata } from "next";
import { findAllMotors } from "@/features/motor/services/motor.service";
import { findAllBrands } from "@/features/motor/services/motorBrand.service";
import { MotorList } from "@/features/motor/components/MotorList";

export const metadata: Metadata = {
  title: "Motorcycles - HrungMoto",
  description: "Manage motorcycle models catalog",
};

export default async function AdminMotorsPage() {
  const [motors, brands] = await Promise.all([
    findAllMotors(),
    findAllBrands({ isActive: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Motorcycle Models</h1>
        <p className="text-sm text-muted-foreground">
          Maintain your shop catalog of motorcycle models, brands, and transmission types
        </p>
      </div>

      <MotorList initialMotors={motors} brands={brands} />
    </div>
  );
}
