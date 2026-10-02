import React from "react";
import type { Metadata } from "next";
import { findAllServices } from "@/features/services/services/motoService.service";
import { ServiceList } from "@/features/services/components/ServiceList";

export const metadata: Metadata = {
  title: "Repair Services - HrungMoto",
  description: "Manage motorcycle repair and maintenance services",
};

export default async function AdminServicesPage() {
  const services = await findAllServices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Repair Services</h1>
        <p className="text-sm text-muted-foreground">
          Maintain your shop labor, maintenance packages, and repair service catalog
        </p>
      </div>

      <ServiceList initialServices={services} />
    </div>
  );
}
