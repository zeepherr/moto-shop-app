import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No completed orders yet</p>
        ) : (
          orders.map((order) => {
            const customerName = order.member
              ? `${order.member.firstName} ${order.member.lastName}`
              : "Guest Customer";
            return (
              <div key={order.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">{customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.orderNumber} • {order.orderItems.length} {order.orderItems.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">฿{Number(order.finalTotal).toLocaleString()}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">Completed</span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
