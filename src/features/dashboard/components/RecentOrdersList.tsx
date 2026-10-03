import React from "react";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";

interface OrderItem {
  id: number;
  itemNameSnapshot: string;
  quantity: number;
}

interface OrderSummary {
  id: number;
  orderNumber: string;
  finalTotal: number | string | { toString: () => string };
  completedAt: Date | null;
  member?: { firstName: string; lastName: string; email: string | null } | null;
  orderItems: OrderItem[];
}

export const RecentOrdersList: React.FC<{ orders: OrderSummary[] }> = ({ orders }) => {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md p-5 transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-border/40">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Recent Activity
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Latest completed customer orders
          </p>
        </div>
        <Link
          href="/admin/orders?status=COMPLETED"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#2997ff] hover:underline"
        >
          <span>View all</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-border/40 pt-1">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ShoppingCart className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-foreground">No recent transactions</p>
            <p className="text-xs text-muted-foreground mt-0.5">Completed POS orders will appear here</p>
          </div>
        ) : (
          orders.map((order) => {
            const customerName = order.member
              ? `${order.member.firstName} ${order.member.lastName}`
              : "Walk-in Customer";

            const initials = order.member
              ? `${order.member.firstName[0] || ""}${order.member.lastName[0] || ""}`.toUpperCase()
              : "WC";

            return (
              <Link key={order.id} href={`/admin/orders?status=COMPLETED&search=${encodeURIComponent(order.orderNumber)}`} className="flex items-center justify-between rounded-lg py-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted/50 text-xs font-semibold text-foreground">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{customerName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.orderNumber} • {order.orderItems.length} {order.orderItems.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-semibold text-foreground tabular-nums">
                    ฿{Number(order.finalTotal).toLocaleString()}
                  </p>
                  <span className="inline-block mt-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                    Paid
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};
