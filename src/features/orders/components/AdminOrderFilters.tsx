import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import type { AdminOrderFilters as FilterValues } from "../services/admin-order-report.service";

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
        <select name="status" defaultValue={filters.status ?? ""} className={selectClass} aria-label="Order status">
          <option value="">All statuses</option><option value="COMPLETED">Completed</option><option value="PENDING">Pending</option><option value="CANCELLED">Cancelled</option>
        </select>
        <select name="payment" defaultValue={filters.payment ?? ""} className={selectClass} aria-label="Payment method">
          <option value="">All payments</option><option value="CASH">Cash</option><option value="QR">QR</option>
        </select>
        <select name="customerType" defaultValue={filters.customerType ?? ""} className={selectClass} aria-label="Customer type">
          <option value="">All customers</option><option value="MEMBER">Members</option><option value="GUEST">Walk-ins</option>
        </select>
        <select name="productId" defaultValue={filters.productId ?? ""} className={selectClass} aria-label="Product">
          <option value="">All products</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>)}
        </select>
        <select name="memberId" defaultValue={filters.memberId ?? ""} className={selectClass} aria-label="Member">
          <option value="">All members</option>{members.map((member) => <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>)}
        </select>
        <select name="brandId" defaultValue={filters.brandId ?? ""} className={selectClass} aria-label="Motorcycle brand">
          <option value="">All motor brands</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
        </select>
        <select name="motorType" defaultValue={filters.motorType ?? ""} className={selectClass} aria-label="Motorcycle type">
          <option value="">All motor types</option><option value="AUTOMATIC">Automatic</option><option value="MANUAL">Manual</option>
        </select>
        <select name="handledById" defaultValue={filters.handledById ?? ""} className={selectClass} aria-label="Handled by">
          <option value="">All staff</option>{handlers.map((handler) => <option key={handler.id} value={handler.id}>{handler.firstName} {handler.lastName}</option>)}
        </select>
        <label><span className="mb-1 block text-xs text-muted-foreground">From</span><input name="from" type="date" defaultValue={filters.from} className={`${selectClass} w-full`} /></label>
        <label><span className="mb-1 block text-xs text-muted-foreground">To</span><input name="to" type="date" defaultValue={filters.to} className={`${selectClass} w-full`} /></label>
      </div>
      <div className="mt-4 flex justify-end gap-2 border-t border-border/60 pt-4">
        <Link href="/admin/orders" className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">Clear</Link>
        <button type="submit" className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Apply filters</button>
      </div>
    </form>
  );
}
