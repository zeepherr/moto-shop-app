import { ManagementLayout } from "@/components/management/ManagementLayout";
import type { StaffDailySalesReport } from "../services/staff-daily-sales.service";
import { StaffSalesBreakdown } from "./StaffSalesBreakdown";
import { StaffSalesList } from "./StaffSalesList";

const money = (amount: number) =>
  `฿${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export function StaffSalesPage({ report }: { report: StaffDailySalesReport }) {
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${report.date}T12:00:00+07:00`));

  return (
    <ManagementLayout className="max-w-6xl !space-y-5 sm:!space-y-7">
      <header className="flex flex-col gap-2 border-b border-border/70 pb-4 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Sales</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your completed sales for today</p>
        </div>
        <p className="text-sm font-medium tabular-nums text-muted-foreground">{formattedDate}</p>
      </header>

      <section aria-label="Today's sales summary" className="grid divide-y divide-border/70 border-y border-border/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <SummaryValue label="Completed orders" value={report.metrics.completedOrderCount.toLocaleString()} />
        <SummaryValue label="Sales revenue" value={money(report.metrics.revenue)} />
        <SummaryValue label="Average order" value={money(report.metrics.averageOrderValue)} />
      </section>

      <StaffSalesBreakdown report={report} />
      <StaffSalesList report={report} />
    </ManagementLayout>
  );
}

function SummaryValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0 sm:px-5 sm:py-4 sm:first:pl-0 sm:last:pr-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-foreground sm:text-2xl">{value}</p>
    </div>
  );
}
