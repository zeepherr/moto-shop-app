import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
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
  return (
    <form method="get" className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Order filters</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="relative xl:col-span-2">
          <span className="sr-only">Search orders</span>
          <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
          <input name="search" defaultValue={filters.search} placeholder="Order number, member name, email or phone" className={`${selectClass} w-full pl-9`} />
        </label>
        <Select name="status" defaultValue={filters.status ?? ""} className={selectClass} aria-label="Order status" options={[
          { value: "", label: "All statuses" }, { value: "COMPLETED", label: "Completed" }, { value: "PENDING", label: "Pending" }, { value: "CANCELLED", label: "Cancelled" },
        ]} />
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
        <label><span className="mb-1 block text-xs text-muted-foreground">From</span><DatePicker name="from" defaultValue={filters.from} className={`${selectClass} w-full`} placeholder="Choose start date" /></label>
        <label><span className="mb-1 block text-xs text-muted-foreground">To</span><DatePicker name="to" defaultValue={filters.to} className={`${selectClass} w-full`} placeholder="Choose end date" /></label>
      </div>
      <div className="mt-4 flex justify-end gap-2 border-t border-border/60 pt-4">
        <Link href="/admin/orders" className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">Clear</Link>
        <button type="submit" className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Apply filters</button>
      </div>
    </form>
  );
}
