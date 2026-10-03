import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Banknote, Boxes, ChartNoAxesCombined, CircleDollarSign, ReceiptText, Wrench } from "lucide-react";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { PageHeader } from "@/components/management/PageHeader";
import { QuickStatCard } from "@/components/management/QuickStatCard";
import { RevenueReportCharts } from "@/features/dashboard/components/RevenueReportCharts";
import { getRevenueReport, type RevenuePeriod } from "@/features/dashboard/services/revenue-report.service";

export const metadata: Metadata = { title: "Revenue Details - HrungMoto", description: "Revenue, product cost, and labor sales reporting" };
export const dynamic = "force-dynamic";

const periods: Array<{ value: RevenuePeriod; label: string }> = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
];
const money = (value: number) => `฿${Math.round(value).toLocaleString()}`;

export default async function RevenueDetailsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const requestedPeriod = (await searchParams).period;
  const period: RevenuePeriod = periods.some((item) => item.value === requestedPeriod) ? requestedPeriod as RevenuePeriod : "month";
  const report = await getRevenueReport(period);
  const { metrics } = report;

  return (
    <ManagementLayout>
      <PageHeader title="Revenue Details" description="Completed sales, product cost, labor revenue, and payment performance">
        <Link href="/admin" className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          <ArrowLeft className="size-4" /> Dashboard
        </Link>
      </PageHeader>

      <nav className="flex w-fit max-w-full overflow-x-auto rounded-xl border border-border/70 bg-muted/40 p-1" aria-label="Revenue reporting period">
        {periods.map((item) => (
          <Link key={item.value} href={`/admin/revenue?period=${item.value}`} aria-current={period === item.value ? "page" : undefined} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${period === item.value ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <QuickStatCard label="Net revenue" value={money(metrics.revenue)} subtext={`${metrics.orderCount} completed orders`} icon={<CircleDollarSign className="size-4" />} tone="blue" />
        <QuickStatCard label="Estimated product cost" value={money(metrics.estimatedProductCost)} subtext="Current catalog cost × quantity sold" icon={<Boxes className="size-4" />} tone="warning" />
        <QuickStatCard label="Gross profit before labor" value={money(metrics.grossProfitBeforeLabor)} subtext="Revenue minus estimated product cost" icon={<ChartNoAxesCombined className="size-4" />} tone="success" />
        <QuickStatCard label="Labor service revenue" value={money(metrics.laborRevenue)} subtext="Service lines sold in this period" icon={<Wrench className="size-4" />} tone="blue" />
        <QuickStatCard label="Average order" value={money(metrics.averageOrder)} subtext={`${money(metrics.discounts)} discounts recorded`} icon={<ReceiptText className="size-4" />} />
        <QuickStatCard label="Product revenue" value={money(metrics.productRevenue)} subtext="Sales from inventory items" icon={<Banknote className="size-4" />} />
      </div>

      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
        Labor cost is not recorded in the current database. Gross profit excludes technician wages and overhead; product cost uses the current catalog cost because historical cost is not stored on order items.
      </div>

      <RevenueReportCharts period={period} trend={report.trend} productRevenue={metrics.productRevenue} laborRevenue={metrics.laborRevenue} cashRevenue={report.paymentMix.cash} qrRevenue={report.paymentMix.qr} />

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        <div className="border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">Recent transactions</h2>
          <p className="mt-1 text-xs text-muted-foreground">Latest 25 completed orders in the selected period</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Handled by</th><th className="px-5 py-3">Payment</th><th className="px-5 py-3 text-right">Total</th></tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {report.transactions.length ? report.transactions.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3"><p className="font-medium text-foreground">{order.orderNumber}</p><p className="mt-0.5 text-xs text-muted-foreground">{order.completedAt ? new Date(order.completedAt).toLocaleString("en-GB", { timeZone: "Asia/Bangkok", dateStyle: "medium", timeStyle: "short" }) : "—"}</p></td>
                  <td className="px-5 py-3 text-foreground">{order.customer}</td>
                  <td className="px-5 py-3 text-muted-foreground">{order.handledBy}</td>
                  <td className="px-5 py-3 text-muted-foreground">{order.paymentMethod ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-foreground">{money(order.total)}</td>
                </tr>
              )) : <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">No completed orders in this period.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </ManagementLayout>
  );
}
