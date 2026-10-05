import Link from "next/link";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import type { AdminOrderFilters as FilterValues } from "../services/admin-order-report.service";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

interface Option { id: number; name: string }

interface AdminOrderFiltersProps {
  filters: FilterValues;
  products: Array<{ id: number; name: string; sku: string }>;
  members: Array<{ id: number; firstName: string; lastName: string }>;
  brands: Option[];
  handlers: Array<{ id: number; firstName: string; lastName: string }>;
}

export function AdminOrderFilters({ filters, products, members, brands, handlers }: AdminOrderFiltersProps) {
  const selectClass = "h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring";
  const secondaryFilterValues = [
    filters.payment,
    filters.customerType,
    filters.productId,
    filters.memberId,
    filters.brandId,
    filters.motorType,
    filters.handledById,
    filters.from,
    filters.to,
  ];
  const activeSecondaryFilters = secondaryFilterValues.filter(Boolean).length;

  return (
    <form method="get" aria-label="Order filters" className="rounded-2xl border border-border/70 bg-card p-3 sm:p-3.5">
      <h2 className="sr-only">Order filters</h2>
      <div className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[minmax(12rem,1fr)_12rem_auto_auto_auto]">
        <label className="relative col-span-2 sm:col-span-1">
          <span className="sr-only">Search orders by order number, customer name, email or phone</span>
          <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" aria-hidden="true" />
          <input
            name="search"
            defaultValue={filters.search}
            placeholder="Search orders or customers"
            className={`${selectClass} w-full pl-9`}
          />
        </label>

        <Select name="status" defaultValue={filters.status ?? ""} className={selectClass} aria-label="Order status" options={[
          { value: "", label: "All statuses" }, { value: "COMPLETED", label: "Completed" }, { value: "PENDING", label: "Pending" }, { value: "CANCELLED", label: "Cancelled" },
        ]} />

        <details open={activeSecondaryFilters > 0} className="group col-span-2 min-w-0 sm:col-span-1">
          <summary className="flex h-10 cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <SlidersHorizontal className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">More filters</span>
            {activeSecondaryFilters > 0 && (
              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold tabular-nums text-primary" aria-label={`${activeSecondaryFilters} additional filters active`}>
                {activeSecondaryFilters}
              </span>
            )}
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="mt-3 grid gap-2.5 border-t border-border/60 pt-3 sm:grid-cols-2 xl:grid-cols-4">
            <Select name="payment" defaultValue={filters.payment ?? ""} className={selectClass} aria-label="Payment method" options={[
              { value: "", label: "All payments" }, { value: "CASH", label: "Cash" }, { value: "QR", label: "QR" },
            ]} />
            <Select name="customerType" defaultValue={filters.customerType ?? ""} className={selectClass} aria-label="Customer type" options={[
              { value: "", label: "All customers" }, { value: "MEMBER", label: "Members" }, { value: "GUEST", label: "Walk-ins" },
            ]} />
            <Select name="productId" defaultValue={filters.productId ?? ""} className={selectClass} aria-label="Product" options={[
              { value: "", label: "All products" }, ...products.map((product) => ({ value: String(product.id), label: `${product.name} · ${product.sku}` })),
            ]} />
            <Select name="memberId" defaultValue={filters.memberId ?? ""} className={selectClass} aria-label="Member" options={[
              { value: "", label: "All members" }, ...members.map((member) => ({ value: String(member.id), label: `${member.firstName} ${member.lastName}` })),
            ]} />
            <Select name="brandId" defaultValue={filters.brandId ?? ""} className={selectClass} aria-label="Motorcycle brand" options={[
              { value: "", label: "All motor brands" }, ...brands.map((brand) => ({ value: String(brand.id), label: brand.name })),
            ]} />
            <Select name="motorType" defaultValue={filters.motorType ?? ""} className={selectClass} aria-label="Motorcycle type" options={[
              { value: "", label: "All motor types" }, { value: "AUTOMATIC", label: "Automatic" }, { value: "MANUAL", label: "Manual" },
            ]} />
            <Select name="handledById" defaultValue={filters.handledById ?? ""} className={selectClass} aria-label="Handled by" options={[
              { value: "", label: "All staff" }, ...handlers.map((handler) => ({ value: String(handler.id), label: `${handler.firstName} ${handler.lastName}` })),
            ]} />
            <label className="min-w-0">
              <span className="mb-1 block text-xs text-muted-foreground">From date</span>
              <DatePicker name="from" defaultValue={filters.from} className={`${selectClass} w-full`} placeholder="Choose start date" />
            </label>
            <label className="min-w-0">
              <span className="mb-1 block text-xs text-muted-foreground">To date</span>
              <DatePicker name="to" defaultValue={filters.to} className={`${selectClass} w-full`} placeholder="Choose end date" />
            </label>
          </div>
        </details>

        <Link href="/admin/orders" className="inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Clear</Link>
        <button type="submit" className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">Apply</button>
      </div>
    </form>
  );
}
