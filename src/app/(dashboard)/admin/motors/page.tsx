import React from "react";
import type { Metadata } from "next";
import { findAllMotors } from "@/features/motor/services/motor.service";
import { findAllBrands } from "@/features/motor/services/motorBrand.service";
import { MotorList } from "@/features/motor/components/MotorList";

export const metadata: Metadata = {
  title: "Motorcycles - HrungMoto",
  description: "Manage motorcycle models catalog",
};

export const dynamic = "force-dynamic";

export default async function AdminMotorsPage() {
  const [rawMotors, rawBrands] = await Promise.all([
    findAllMotors(),
    findAllBrands({ isActive: true }),
  ]);

  const motors = rawMotors.map((m) => ({
    id: m.id,
    motorBrandId: m.motorBrandId,
    model: m.model,
    type: m.type,
    isActive: m.isActive,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
    motorBrand: m.motorBrand,
  }));

  const brands = rawBrands.map((b) => ({
    id: b.id,
    name: b.name,
    isActive: b.isActive,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    _count: b._count,
  }));

  return <MotorList initialMotors={motors} brands={brands} />;
}
