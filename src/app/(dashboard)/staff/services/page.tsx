import type { Metadata } from "next";
import { StaffServiceCatalog } from "@/features/services/components/StaffServiceCatalog";
import { findAllServices } from "@/features/services/services/motoService.service";

export const metadata: Metadata = {
  title: "Service Catalog - HrungMoto",
  description: "Browse active workshop services and standard rates",
};

export const dynamic = "force-dynamic";

export default async function StaffServicesPage() {
  const services = await findAllServices({ isActive: true });

  return (
    <StaffServiceCatalog
      services={services.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: Number(service.price),
      }))}
    />
  );
}
