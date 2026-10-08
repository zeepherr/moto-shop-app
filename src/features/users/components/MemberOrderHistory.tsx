import { ChevronDown, ClipboardList } from "lucide-react";
import type { MemberProfileData } from "./member-profile.types";

const formatMoney = (amount: number) => `฿${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const formatDate = (date: string) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date(date));

export function MemberOrderHistory({ orders, totalSpent }: { orders: MemberProfileData["orders"]; totalSpent: number }) {
  return <section aria-labelledby="member-orders-heading">
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-4"><div><h2 id="member-orders-heading" className="text-base font-semibold text-foreground">Order history</h2><p className="mt-1 text-sm text-muted-foreground">Your orders, including their current status and item details.</p></div><p className="text-sm text-muted-foreground"><span className="font-semibold tabular-nums text-foreground">{orders.length}</span> {orders.length === 1 ? "order" : "orders"} <span aria-hidden="true">·</span> {formatMoney(totalSpent)} spent on completed visits</p></div>
    {orders.length ? <ol className="divide-y divide-border/60">{orders.map((order) => <li key={order.id}>
      <details className="group"><summary className="flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-3 py-4 [&::-webkit-details-marker]:hidden"><span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className="font-medium text-foreground">{formatDate(order.completedAt ?? order.createdAt)}</span><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${order.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : order.status === "PENDING" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-muted text-muted-foreground"}`}>{statusLabel(order.status)}</span></span><span className="mt-1 block truncate text-xs text-muted-foreground">{order.orderNumber}{order.motor ? ` · ${order.motor.motorBrand.name} ${order.motor.model}` : ""}</span></span><span className="flex shrink-0 items-center gap-2"><span className="text-sm font-semibold tabular-nums text-foreground">{formatMoney(order.finalTotal)}</span><ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" /></span></summary>
      <div className="space-y-2 pb-4 pl-1">{order.orderItems.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span className="min-w-0"><span className="mr-2 text-xs text-muted-foreground">{item.itemType === "SERVICE" ? "Service" : "Product"}</span>{item.itemNameSnapshot}{item.quantity > 1 ? ` × ${item.quantity}` : ""}</span><span className="shrink-0 tabular-nums text-muted-foreground">{formatMoney(item.lineTotal)}</span></div>)}</div>
    </details></li>)}</ol> : <div className="flex items-start gap-3 py-6"><ClipboardList className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" /><div><p className="text-sm font-medium text-foreground">No orders yet</p><p className="mt-1 text-sm text-muted-foreground">Orders linked to your account will appear here.</p></div></div>}
  </section>;
}

function statusLabel(status: MemberProfileData["orders"][number]["status"]) {
  return status === "COMPLETED" ? "Completed" : status === "PENDING" ? "In progress" : "Cancelled";
}
