import Link from "next/link";
import { AlertTriangle, ArrowRight, Ban, Boxes, Clock3 } from "lucide-react";

interface PendingOrder {
  id: number;
  orderNumber: string;
  createdAt: string;
  finalTotal: number;
}

interface DashboardActionCenterProps {
  pendingOrders: PendingOrder[];
  outOfStockCount: number;
  lowStockCount: number;
  cancelledTodayCount: number;
}

export function DashboardActionCenter(props: DashboardActionCenterProps) {
  const alerts = [
    { label: "Out of stock", value: props.outOfStockCount, href: "/admin/products", icon: Boxes, urgent: props.outOfStockCount > 0 },
    { label: "Low stock", value: props.lowStockCount, href: "/admin/products", icon: AlertTriangle, urgent: props.lowStockCount > 0 },
    { label: "Cancelled today", value: props.cancelledTodayCount, href: "/admin/orders?status=CANCELLED", icon: Ban, urgent: props.cancelledTodayCount > 0 },
  ];

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Action center</h2>
          <p className="mt-1 text-xs text-muted-foreground">Exceptions that may need attention</p>
        </div>
        <Link href="/admin/orders?status=PENDING" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Pending orders <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="grid gap-2 py-4 sm:grid-cols-3">
        {alerts.map(({ label, value, href, icon: Icon, urgent }) => (
          <Link key={label} href={href} className="flex items-center justify-between rounded-xl bg-muted/45 px-3 py-2.5 transition-colors hover:bg-muted">
            <span className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className={`size-3.5 ${urgent ? "text-amber-500" : ""}`} />{label}</span>
            <span className="font-semibold tabular-nums text-foreground">{value}</span>
          </Link>
        ))}
      </div>

      <div className="space-y-1">
        {props.pendingOrders.length ? props.pendingOrders.map((order) => (
          <Link key={order.id} href={`/admin/orders?status=PENDING&search=${encodeURIComponent(order.orderNumber)}`} className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50">
            <span className="flex min-w-0 items-center gap-2.5">
              <Clock3 className="size-4 shrink-0 text-amber-500" />
              <span className="truncate text-sm font-medium text-foreground">{order.orderNumber}</span>
            </span>
            <span className="text-sm font-semibold tabular-nums text-foreground">฿{order.finalTotal.toLocaleString()}</span>
          </Link>
        )) : (
          <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/8 px-3 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            <Clock3 className="size-4" /> No pending orders require attention.
          </div>
        )}
      </div>
    </section>
  );
}
