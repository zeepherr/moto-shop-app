import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Banknote, CheckCircle2, Clock3, ReceiptText } from "lucide-react";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";
import { QuickStatCard } from "@/components/management/QuickStatCard";
import { AdminOrderFilters } from "@/features/orders/components/AdminOrderFilters";
import { AdminOrdersTable } from "@/features/orders/components/AdminOrdersTable";
import { getAdminOrderReport, type AdminOrderFilters as FilterValues } from "@/features/orders/services/admin-order-report.service";

export const metadata: Metadata = { title: "Orders - HrungMoto", description: "Order operations, filters, and transaction details" };
export const dynamic = "force-dynamic";

const money = (value: number) => `฿${Math.round(value).toLocaleString()}`;

const buildPageHref = (filters: FilterValues, page: number) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value && key !== "page") params.set(key, value);
  }
  params.set("page", String(page));
  return `/admin/orders?${params}`;
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const filters = Object.fromEntries(
    Object.entries(rawParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  ) as FilterValues;
  const report = await getAdminOrderReport(filters);
  const currentPage = report.filters.page;

  return (
    <ManagementLayout>
      <PageHeader title="Orders" description="Review sales, customers, motorcycles, payments, and order line details" count={report.metrics.total}>
        <Link href="/admin" className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          <ArrowLeft className="size-4" /> Dashboard
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickStatCard label="Filtered order value" value={money(report.metrics.totalValue)} subtext="Across current filter results" icon={<Banknote className="size-4" />} tone="blue" />
        <QuickStatCard label="Completed" value={report.metrics.statusCounts.COMPLETED} subtext="Successfully paid orders" icon={<CheckCircle2 className="size-4" />} tone="success" />
        <QuickStatCard label="Pending" value={report.metrics.statusCounts.PENDING} subtext="Orders waiting for checkout" icon={<Clock3 className="size-4" />} tone="warning" />
        <QuickStatCard label="Average value" value={money(report.metrics.averageValue)} subtext={`${report.metrics.statusCounts.CANCELLED} cancelled orders`} icon={<ReceiptText className="size-4" />} />
      </div>

      <AdminOrderFilters filters={filters} {...report.options} />

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div><h2 className="text-base font-semibold text-foreground">Order results</h2><p className="mt-1 text-xs text-muted-foreground">Expand any order to inspect items and totals</p></div>
          <p className="text-xs tabular-nums text-muted-foreground">Page {currentPage} of {report.filters.totalPages}</p>
        </div>
        <div className="overflow-x-auto"><div className="min-w-[900px]"><AdminOrdersTable orders={report.orders} /></div></div>
        {report.filters.totalPages > 1 && (
          <nav className="flex items-center justify-between border-t border-border/60 px-5 py-4" aria-label="Order pages">
            {currentPage > 1 ? <Link href={buildPageHref(filters, currentPage - 1)} className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">Previous</Link> : <span />}
            {currentPage < report.filters.totalPages ? <Link href={buildPageHref(filters, currentPage + 1)} className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">Next</Link> : <span />}
          </nav>
        )}
      </section>
    </ManagementLayout>
  );
}
