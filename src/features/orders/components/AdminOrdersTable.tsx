import { ChevronDown, PackageOpen } from "lucide-react";

interface AdminOrder {
  id: number;
  orderNumber: string;
  customerType: string;
  status: string;
  paymentMethod: string | null;
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  finalTotal: number;
  createdAt: string;
  completedAt: string | null;
  member: { id: number; firstName: string; lastName: string } | null;
  handledBy: { id: number; firstName: string; lastName: string };
  cancellationReason: string | null;
  cancelledBy: { id: number; firstName: string; lastName: string } | null;
  motor: { id: number; model: string; type: string; brand: { id: number; name: string } } | null;
  items: Array<{ id: number; itemType: string; itemNameSnapshot: string; quantity: number; unitPrice: number; lineTotal: number }>;
}

const money = (value: number) => `฿${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusClass: Record<string, string> = {
  COMPLETED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  CANCELLED: "border-destructive/20 bg-destructive/10 text-destructive",
};

export function AdminOrdersTable({ orders }: { orders: AdminOrder[] }) {
  if (!orders.length) {
    return <div className="flex flex-col items-center py-16 text-center"><PackageOpen className="size-8 text-muted-foreground/50" /><p className="mt-3 text-sm font-semibold text-foreground">No matching orders</p><p className="mt-1 text-xs text-muted-foreground">Adjust or clear the current filters.</p></div>;
  }
  return (
    <div className="divide-y divide-border/60">
      {orders.map((order) => (
        <details key={order.id} className="group">
          <summary className="grid cursor-pointer list-none grid-cols-[minmax(190px,1.3fr)_minmax(150px,1fr)_minmax(150px,1fr)_110px_120px_24px] items-center gap-4 px-5 py-4 hover:bg-muted/30">
            <div><p className="font-semibold text-foreground">{order.orderNumber}</p><p className="mt-0.5 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Bangkok", dateStyle: "medium", timeStyle: "short" })}</p></div>
            <div><p className="truncate text-sm text-foreground">{order.member ? `${order.member.firstName} ${order.member.lastName}` : "Walk-in customer"}</p><p className="mt-0.5 text-xs text-muted-foreground">{order.customerType}</p></div>
            <div><p className="truncate text-sm text-foreground">{order.motor ? `${order.motor.brand.name} ${order.motor.model}` : "No motorcycle"}</p><p className="mt-0.5 text-xs text-muted-foreground">{order.motor?.type ?? "—"}</p></div>
            <div><span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${statusClass[order.status]}`}>{order.status.toLowerCase()}</span></div>
            <div className="text-right"><p className="font-semibold tabular-nums text-foreground">{money(order.finalTotal)}</p><p className="mt-0.5 text-xs text-muted-foreground">{order.paymentMethod ?? "Unpaid"}</p></div>
            <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-border/50 bg-muted/20 px-5 py-4">
            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order items</p><div className="space-y-2">{order.items.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 text-sm"><span className="min-w-0 truncate text-foreground">{item.itemNameSnapshot} <span className="text-xs text-muted-foreground">× {item.quantity} · {item.itemType.toLowerCase()}</span></span><span className="shrink-0 tabular-nums text-foreground">{money(item.lineTotal)}</span></div>)}</div></div>
              <dl className="space-y-2 rounded-xl border border-border/70 bg-card p-3 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Handled by</dt><dd className="text-foreground">{order.handledBy.firstName} {order.handledBy.lastName}</dd></div>
                {order.status === "CANCELLED" && <>
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Cancelled by</dt><dd className="text-right text-foreground">{order.cancelledBy ? `${order.cancelledBy.firstName} ${order.cancelledBy.lastName}` : "Unknown user"}</dd></div>
                  <div className="border-t border-border/60 pt-2"><dt className="text-muted-foreground">Cancellation reason</dt><dd className="mt-1 text-foreground">{order.cancellationReason || "Not recorded"}</dd></div>
                </>}
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums text-foreground">{money(order.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Product discount{order.discountAmount > 0 ? ` (${order.discountRate}%)` : ""}</dt><dd className="tabular-nums text-foreground">−{money(order.discountAmount)}</dd></div>
                <div className="flex justify-between border-t border-border/60 pt-2 font-semibold"><dt>Total</dt><dd className="tabular-nums">{money(order.finalTotal)}</dd></div>
              </dl>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
