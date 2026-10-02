"use client";

import { useMemo, useState } from "react";
import { Wrench } from "lucide-react";
import { DockedTableCard } from "@/components/management/DockedTableCard";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";

interface CatalogService {
  id: number;
  name: string;
  description: string | null;
  price: number;
}

export function StaffServiceCatalog({ services }: { services: CatalogService[] }) {
  const [search, setSearch] = useState("");

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return services;

    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(term) ||
        service.description?.toLowerCase().includes(term),
    );
  }, [search, services]);

  return (
    <ManagementLayout>
      <PageHeader
        title="Service Catalog"
        description="Browse current workshop services and standard labor rates"
        count={services.length}
      />

      <DockedTableCard
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search services or repair scope..."
        hasActiveFilters={Boolean(search.trim())}
        onClearFilters={() => setSearch("")}
        totalFiltered={filteredServices.length}
        totalAll={services.length}
        entityName="services"
      >
        {filteredServices.length > 0 ? (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/20">
              <tr>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Service
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Scope &amp; details
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Standard rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredServices.map((service) => (
                <tr key={service.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Wrench className="size-4.5" />
                      </div>
                      <p className="font-semibold text-foreground">{service.name}</p>
                    </div>
                  </td>
                  <td className="max-w-xl px-4 py-3.5 text-muted-foreground">
                    {service.description || "Standard technician labor service"}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-foreground">
                    ฿{service.price.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Wrench className="size-5" />
            </div>
            <p className="font-medium text-foreground">No services found</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Try a different service name or repair scope.
            </p>
          </div>
        )}
      </DockedTableCard>
    </ManagementLayout>
  );
}
