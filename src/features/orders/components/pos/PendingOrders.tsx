"use client";

import React, { useEffect, useState } from "react";
import { Clock3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPendingOrdersAction } from "../../actions/order-query.actions";
import type { OrderDTO } from "../../types";

interface PendingOrdersProps {
  onSelectOrder: (orderId: number) => void;
  isSelecting?: boolean;
}

export const PendingOrders: React.FC<PendingOrdersProps> = ({
  onSelectOrder,
  isSelecting = false,
}) => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getPendingOrdersAction();
        if (mounted) {
          if (res.success && res.data) {
            setOrders(res.data);
          } else {
            setIsError(true);
          }
        }
      } catch {
        if (mounted) setIsError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading || isSelecting) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-6 text-center text-sm text-destructive">
        Failed to load pending orders.
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-8 text-center">
        <Clock3 className="mx-auto mb-2 size-7 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground">No pending orders</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Held orders will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <Button
          key={order.id}
          type="button"
          variant="outline"
          onClick={() => onSelectOrder(order.id)}
          className="h-auto w-full justify-between px-3 py-2.5 text-left cursor-pointer hover:border-primary/40"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              Order #{order.orderNumber || order.id}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.member
                ? `${order.member.firstName || ""} ${order.member.lastName || ""}`.trim()
                : "Guest customer"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] text-muted-foreground">
              {new Date(order.createdAt).toLocaleString("en-GB", {
                timeZone: "Asia/Bangkok",
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {order.finalTotal != null && (
              <span className="text-sm font-semibold text-foreground">
                ฿{Number(order.finalTotal).toLocaleString()}
              </span>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
};
