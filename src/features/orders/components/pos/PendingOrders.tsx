"use client";

import React, { useEffect, useState } from "react";
import { Clock3, Loader2, Search, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPendingOrdersAction } from "../../actions/order-query.actions";
import type { OrderDTO } from "../../types";
import { ORDER_CANCELLATION_REASONS } from "../../constants/cancellation-reasons";

interface PendingOrdersProps {
  onSelectOrder: (orderId: number) => void;
  onCancelOrder: (orderId: number, reason: string) => Promise<boolean>;
  isSelecting?: boolean;
}

export const PendingOrders: React.FC<PendingOrdersProps> = ({
  onSelectOrder,
  onCancelOrder,
  isSelecting = false,
}) => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [search, setSearch] = useState("");
  const [orderToCancel, setOrderToCancel] = useState<OrderDTO | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  const confirmCancel = async () => {
    if (!orderToCancel || isCancelling) return;
    setIsCancelling(true);
    try {
      if (await onCancelOrder(orderToCancel.id, cancelReason)) {
        setOrders((current) => current.filter((order) => order.id !== orderToCancel.id));
        setOrderToCancel(null);
        setCancelReason("");
      }
    } finally {
      setIsCancelling(false);
    }
  };

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

  const term = search.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    const customer = order.member ? `${order.member.firstName} ${order.member.lastName}` : "guest customer";
    return !term || `${order.orderNumber} ${order.id} ${customer}`.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter by order or customer..." className="h-11 pl-9 text-sm" />
      </div>
      <p className="text-xs text-muted-foreground">Most recent {orders.length === 50 ? "50" : orders.length} pending tickets</p>
      {filteredOrders.length ? filteredOrders.map((order) => (
        <div key={order.id} className="flex items-stretch gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSelectOrder(order.id)}
          className="h-auto min-h-16 min-w-0 flex-1 justify-between px-3 py-2.5 text-left cursor-pointer hover:border-primary/40"
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
        <Button type="button" variant="outline" aria-label={`Cancel order ${order.orderNumber || order.id}`} title="Cancel pending order" onClick={() => { setOrderToCancel(order); setCancelReason(""); }} className="min-h-11 min-w-11 self-center px-2 text-destructive hover:text-destructive">
          <XCircle className="size-4" />
        </Button>
        </div>
      )) : <p className="py-6 text-center text-sm text-muted-foreground">No pending tickets match that search.</p>}
      <Dialog open={Boolean(orderToCancel)} onOpenChange={(open) => !open && !isCancelling && setOrderToCancel(null)}>
        <DialogContent data-pos-modal="true">
          <DialogHeader>
            <DialogTitle>Cancel pending order?</DialogTitle>
            <DialogDescription>
              Order #{orderToCancel?.orderNumber || orderToCancel?.id} will be marked cancelled. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <label className="mb-2 block text-sm font-medium" htmlFor="pending-cancel-reason">Reason for cancellation</label>
          <select id="pending-cancel-reason" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} className="mb-4 h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Select a reason</option>
            {ORDER_CANCELLATION_REASONS.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
          </select>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isCancelling} onClick={() => { setOrderToCancel(null); setCancelReason(""); }}>Keep order</Button>
            <Button type="button" variant="destructive" disabled={isCancelling || !cancelReason} onClick={confirmCancel}>
              {isCancelling ? "Cancelling…" : "Cancel order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
