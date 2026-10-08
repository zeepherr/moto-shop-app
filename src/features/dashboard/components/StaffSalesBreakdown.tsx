import { Banknote, Package, Wrench } from "lucide-react";
import type { StaffDailySalesReport } from "../services/staff-daily-sales.service";

const money = (amount: number) =>
  `฿${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const paymentLabel = (method: string) =>
  method === "CASH" ? "Cash" : method === "QR" ? "QR payment" : "Unspecified";

export function StaffSalesBreakdown({ report }: { report: StaffDailySalesReport }) {
  const productSales = report.itemSales.find((item) => item.type === "PRODUCT");
  const serviceSales = report.itemSales.find((item) => item.type === "SERVICE");

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section aria-labelledby="payment-heading" className="min-w-0">
        <SectionHeading id="payment-heading" icon={<Banknote className="size-4" />} title="Payment breakdown" />
        {report.payments.length ? (
          <div className="mt-3 divide-y divide-border/60 border-y border-border/60">
            {report.payments.map((payment) => (
              <div key={payment.method} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 py-3">
                <p className="text-sm font-medium text-foreground">{paymentLabel(payment.method)}</p>
                <p className="text-sm font-semibold tabular-nums text-foreground">{money(payment.revenue)}</p>
                <p className="col-span-2 mt-0.5 text-xs text-muted-foreground">
                  {payment.orderCount} {payment.orderCount === 1 ? "order" : "orders"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="border-y border-border/60 py-5 text-sm text-muted-foreground">No completed sales to break down yet.</p>
        )}
      </section>

      <section aria-labelledby="items-heading" className="min-w-0">
        <SectionHeading id="items-heading" icon={<Package className="size-4" />} title="Items sold" />
        <div className="mt-3 divide-y divide-border/60 border-y border-border/60">
          <ItemSummary icon={<Package className="size-4" />} label="Products" quantity={productSales?.quantity ?? 0} amount={productSales?.revenue ?? 0} />
          <ItemSummary icon={<Wrench className="size-4" />} label="Services" quantity={serviceSales?.quantity ?? 0} amount={serviceSales?.revenue ?? 0} />
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Item totals are before any order-level discount.</p>
      </section>
    </div>
  );
}

function SectionHeading({ id, icon, title }: { id: string; icon: React.ReactNode; title: string }) {
  return (
    <h2 id={id} className="flex items-center gap-2 text-base font-semibold text-foreground">
      <span className="text-primary" aria-hidden="true">{icon}</span>{title}
    </h2>
  );
}

function ItemSummary({
  icon,
  label,
  quantity,
  amount,
}: {
  icon: React.ReactNode;
  label: string;
  quantity: number;
  amount: number;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
      <p className="flex items-center gap-2 text-sm font-medium text-foreground"><span className="text-muted-foreground" aria-hidden="true">{icon}</span>{label}</p>
      <p className="text-sm font-semibold tabular-nums text-foreground">{money(amount)}</p>
      <p className="col-span-2 text-xs text-muted-foreground">{quantity} {quantity === 1 ? "item" : "items"}</p>
    </div>
  );
}
