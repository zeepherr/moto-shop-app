"use client";

import React, { useState } from "react";
import { Clock3, ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { usePosStore } from "../../stores/usePosStore";
import { PosCustomerSelector } from "./PosCustomerSelector";
import { PosCartItem } from "./CartItem";
import { PosPayment } from "./PosPayment";
import { PosCartActions } from "./PosCartAction";
import { PendingOrders } from "./PendingOrders";
import { PaymentMethod } from "@prisma/client";
import { checkoutOrderAction, holdOrderAction, cancelPendingOrderAction } from "../../actions/order.actions";
import { getOrderByIdAction } from "../../actions/order-query.actions";
import { buildCheckoutPayload, buildHoldPayload, pendingOrderToCartItems } from "../../utils/cart.util";
import { toast } from "sonner";

export const PosCart: React.FC = () => {
  const cartItems = usePosStore((store) => store.cartItems);
  const selectedMember = usePosStore((store) => store.selectedMember);
  const pendingOrderId = usePosStore((store) => store.pendingOrderId);
  const setCartItems = usePosStore((store) => store.setCartItems);
  const setSelectedMember = usePosStore((store) => store.setSelectedMember);
  const setPendingOrderId = usePosStore((store) => store.setPendingOrderId);
  const resetOrder = usePosStore((store) => store.resetOrder);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [isPendingSheetOpen, setIsPendingSheetOpen] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.unitPrice ?? item.price) * item.quantity,
    0,
  );
  const hasItems = cartItems.length > 0;
  const numReceived = Number(receivedAmount) || 0;
  const canComplete =
    hasItems &&
    (paymentMethod === PaymentMethod.QR ||
      (numReceived > 0 && numReceived >= subtotal));

  const changeAmount =
    paymentMethod === PaymentMethod.CASH
      ? Math.max(numReceived - subtotal, 0)
      : 0;

  const handleClear = () => {
    resetOrder();
    setPaymentMethod(PaymentMethod.CASH);
    setReceivedAmount("");
  };

  const handleHoldOrder = async () => {
    if (!hasItems) return;
    setIsActionPending(true);
    try {
      const payload = buildHoldPayload({ cartItems, selectedMember, pendingOrderId });
      const res = await holdOrderAction(payload);
      if (res.success) {
        toast.success(pendingOrderId ? "Pending order updated" : "Order held successfully");
        handleClear();
      } else {
        toast.error(res.error || "Failed to hold order");
      }
    } finally {
      setIsActionPending(false);
    }
  };

  const handleCompleteSale = async () => {
    if (!canComplete) return;
    setIsActionPending(true);
    try {
      const finalReceived = paymentMethod === PaymentMethod.QR ? subtotal : numReceived;
      const payload = buildCheckoutPayload({
        cartItems,
        selectedMember,
        paymentMethod,
        receivedAmount: finalReceived,
        pendingOrderId,
      });
      const res = await checkoutOrderAction(payload);
      if (res.success) {
        toast.success("Order completed successfully!");
        handleClear();
      } else {
        toast.error(res.error || "Checkout failed");
      }
    } finally {
      setIsActionPending(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!pendingOrderId) return;
    setIsActionPending(true);
    try {
      const res = await cancelPendingOrderAction(pendingOrderId);
      if (res.success) {
        toast.success("Order cancelled");
        handleClear();
      } else {
        toast.error(res.error || "Failed to cancel order");
      }
    } finally {
      setIsActionPending(false);
    }
  };

  const handleSelectPendingOrder = async (orderId: number) => {
    setIsActionPending(true);
    try {
      const res = await getOrderByIdAction(orderId);
      if (res.success && res.data) {
        const order = res.data;
        setCartItems(pendingOrderToCartItems(order.orderItems as any));
        setSelectedMember(order.member as any);
        setPaymentMethod(order.paymentMethod || PaymentMethod.CASH);
        setReceivedAmount("");
        setPendingOrderId(order.id);
        setIsPendingSheetOpen(false);
      } else {
        toast.error("Failed to load order");
      }
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <aside className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card lg:h-full lg:min-h-0 sm:mt-4 mt-1.5 shadow-sm">
      <div className="shrink-0">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 p-3 lg:p-4">
          <div>
            <h2 className="font-semibold text-foreground text-sm lg:text-base">Current Order</h2>
            <p className="text-xs text-muted-foreground">
              {pendingOrderId ? `Editing ticket #${pendingOrderId}` : "New sale"}
            </p>
          </div>

          <Sheet open={isPendingSheetOpen} onOpenChange={setIsPendingSheetOpen}>
            <SheetTrigger
              render={<Button type="button" variant="outline" size="sm" />}
              className="gap-2 cursor-pointer h-8 text-xs font-medium"
            >
              <Clock3 className="size-3.5 text-muted-foreground" />
              Pending
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Pending Orders</SheetTitle>
                <SheetDescription>Select an order ticket to resume.</SheetDescription>
              </SheetHeader>
              <div className="p-4">
                <PendingOrders onSelectOrder={handleSelectPendingOrder} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <PosCustomerSelector />
      </div>

      <div className="min-h-40 max-h-80 overflow-y-auto border-b border-border/60 p-3 scrollbar-none lg:min-h-0 lg:max-h-none lg:flex-1 lg:p-4">
        {cartItems.length === 0 ? (
          <div className="flex h-full min-h-36 flex-col items-center justify-center text-center">
            <ShoppingCart className="mb-2 size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">Your cart is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">Add a product or service to begin.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {cartItems.map((item) => (
              <PosCartItem key={`${item.itemType}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0">
        <div className="border-b border-border/60 px-3 py-2 lg:px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Items</span>
              <span className="font-semibold text-foreground">{totalItems}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <span className="text-lg font-bold text-foreground">฿{subtotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <PosPayment
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          receivedAmount={receivedAmount}
          setReceivedAmount={setReceivedAmount}
          subtotal={subtotal}
          changeAmount={changeAmount}
        />

        <PosCartActions
          hasItems={hasItems}
          isPending={isActionPending}
          canComplete={canComplete}
          onHold={handleHoldOrder}
          onClear={handleClear}
          onComplete={handleCompleteSale}
          isEditingPending={Boolean(pendingOrderId)}
          onCancel={handleCancelOrder}
        />
      </div>
    </aside>
  );
};
