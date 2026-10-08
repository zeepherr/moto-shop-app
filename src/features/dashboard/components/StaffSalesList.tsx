import { Clock3, ReceiptText } from "lucide-react";
import type { StaffDailySalesReport } from "../services/staff-daily-sales.service";

const money = (amount: number) =>
  `฿${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const time = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Bangkok",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "Time unavailable";

const paymentLabel = (method: string) =>
  method === "CASH" ? "Cash" : method === "QR" ? "QR payment" : "Unspecified";

export function StaffSalesList({ report }: { report: StaffDailySalesReport }) {
  return (
    <section aria-labelledby="completed-sales-heading" className="min-w-0">
      <div className="flex items-end justify-between gap-4 border-b border-border/70 pb-3">
        <div>
          <h2 id="completed-sales-heading" className="flex items-center gap-2 text-base font-semibold text-foreground">
            <ReceiptText className="size-4 text-primary" aria-hidden="true" />Completed sales
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Most recent first · up to 30 orders</p>
        </div>
        {report.metrics.completedOrderCount > 0 && <p className="shrink-0 text-xs tabular-nums text-muted-foreground">{report.metrics.completedOrderCount} total</p>}
      </div>

      {report.recentSales.length ? (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="py-3 pr-4 font-medium">Order</th>
                  <th scope="col" className="px-4 py-3 font-medium">Items</th>
                  <th scope="col" className="px-4 py-3 font-medium">Payment</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {report.recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-foreground">{sale.orderNumber}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3" />{time(sale.completedAt)}</p>
                    </td>
                    <td className="max-w-[340px] px-4 py-3">
                      <p className="truncate text-foreground">{sale.items.map((item) => `${item.name} ×${item.quantity}`).join(", ") || "No item details"}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{paymentLabel(sale.paymentMethod ?? "UNSPECIFIED")}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-foreground">{money(sale.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-border/60 md:hidden">
            {report.recentSales.map((sale) => (
              <li key={sale.id} className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{sale.orderNumber}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3" />{time(sale.completedAt)} · {paymentLabel(sale.paymentMethod ?? "UNSPECIFIED")}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{money(sale.total)}</p>
                </div>
                <p className="mt-2 break-words text-xs leading-5 text-muted-foreground">
                  {sale.items.map((item) => `${item.name} ×${item.quantity}`).join(", ") || "No item details"}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="py-12 text-center">
          <ReceiptText className="mx-auto size-8 text-muted-foreground/70" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium text-foreground">No completed sales yet today</p>
          <p className="mt-1 text-sm text-muted-foreground">Completed orders assigned to you will appear here.</p>
        </div>
      )}
      {report.metrics.completedOrderCount > report.recentSales.length && (
        <p className="border-t border-border/60 py-3 text-center text-xs text-muted-foreground">
          Showing the latest {report.recentSales.length} of {report.metrics.completedOrderCount} completed orders.
        </p>
      )}
    </section>
  );
}
