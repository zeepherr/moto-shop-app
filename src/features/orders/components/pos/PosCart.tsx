"use client";

import React, { useState } from "react";
import { Clock3, ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePosStore } from "../../stores/usePosStore";
import { PosCustomerSelector } from "./PosCustomerSelector";
import { PosCartItem } from "./CartItem";
import { PosPayment } from "./PosPayment";
import { PosCartActions } from "./PosCartAction";
import { PendingOrders } from "./PendingOrders";
import { PosReceiptDialog } from "./PosReceiptDialog";
import { OrderItemType, PaymentMethod } from "@prisma/client";
import { getMemberByIdAction } from "@/features/users/actions/user.actions";
import { checkoutOrderAction, holdOrderAction, cancelPendingOrderAction } from "../../actions/order.actions";
import { getOrderByIdAction } from "../../actions/order-query.actions";
import { buildCheckoutPayload, buildHoldPayload, pendingOrderToCartItems } from "../../utils/cart.util";
import { toast } from "sonner";
import type { CheckoutReceipt, OrderDTO } from "../../types";
import { ORDER_CANCELLATION_REASONS } from "../../constants/cancellation-reasons";

export const PosCart: React.FC<{ productDiscountRate: number }> = ({ productDiscountRate }) => {
  const cartItems = usePosStore((store) => store.cartItems);
  const selectedMember = usePosStore((store) => store.selectedMember);
  const selectedMotorId = usePosStore((store) => store.selectedMotorId);
  const pendingOrderId = usePosStore((store) => store.pendingOrderId);
  const setCartItems = usePosStore((store) => store.setCartItems);
  const setSelectedMember = usePosStore((store) => store.setSelectedMember);
  const setSelectedMotorId = usePosStore((store) => store.setSelectedMotorId);
  const setPendingOrderId = usePosStore((store) => store.setPendingOrderId);
  const resetOrder = usePosStore((store) => store.resetOrder);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [isPendingSheetOpen, setIsPendingSheetOpen] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);
  const [isLoadingPendingOrder, setIsLoadingPendingOrder] = useState(false);
  const [receipt, setReceipt] = useState<CheckoutReceipt | null>(null);
  const [qrConfirmedAmount, setQrConfirmedAmount] = useState<number | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const productSubtotal = cartItems.filter((item) => item.itemType === OrderItemType.PRODUCT).reduce(
    (acc, item) => acc + (item.unitPrice ?? item.price) * item.quantity,
    0,
  );
  const serviceSubtotal = cartItems.filter((item) => item.itemType === OrderItemType.SERVICE).reduce(
    (acc, item) => acc + (item.unitPrice ?? item.price) * item.quantity,
    0,
  );
  const subtotal = productSubtotal + serviceSubtotal;
  const appliedDiscountRate = selectedMember ? productDiscountRate : 0;
  const discountAmount = Math.min(Math.round((productSubtotal * appliedDiscountRate) / 100 * 100) / 100, productSubtotal);
  const totalDue = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
  const hasItems = cartItems.some((item) => item.quantity > 0);
  const isQrPaymentConfirmed = qrConfirmedAmount === totalDue && qrConfirmedAmount !== null;
  const numReceived = Number(receivedAmount) || 0;
  const canComplete = hasItems && (totalDue === 0 || (paymentMethod === PaymentMethod.QR
    ? isQrPaymentConfirmed
    : numReceived >= totalDue));

  const changeAmount =
    paymentMethod === PaymentMethod.CASH
      ? Math.max(numReceived - totalDue, 0)
      : 0;

  const handleClear = () => {
    resetOrder();
    setPaymentMethod(PaymentMethod.CASH);
    setReceivedAmount("");
    setQrConfirmedAmount(null);
  };

  const handleHoldOrder = async () => {
    if (!hasItems) return;
    setIsActionPending(true);
    try {
      const payload = buildHoldPayload({ cartItems, selectedMember, selectedMotorId, pendingOrderId });
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
      const finalReceived = totalDue === 0 ? 0 : paymentMethod === PaymentMethod.QR ? totalDue : numReceived;
      const payload = buildCheckoutPayload({
        cartItems,
        selectedMember,
        selectedMotorId,
        paymentMethod: totalDue === 0 ? null : paymentMethod,
        receivedAmount: finalReceived,
        pendingOrderId,
        discountRate: productDiscountRate,
      });
      const res = await checkoutOrderAction(payload);
      if (res.success) {
        toast.success("Order completed successfully!");
        handleClear();
        if ("data" in res && res.data) setReceipt(res.data);
      } else {
        toast.error(res.error || "Checkout failed");
      }
    } finally {
      setIsActionPending(false);
    }
  };

  const handleCancelOrder = async (orderId: number, reason: string) => {
    setIsActionPending(true);
    try {
      const res = await cancelPendingOrderAction({ orderId, reason });
      if (res.success) {
        toast.success("Order cancelled");
        if (orderId === pendingOrderId) handleClear();
        return true;
      } else {
        toast.error(res.error || "Failed to cancel order");
        return false;
      }
    } finally {
      setIsActionPending(false);
    }
  };

  const handleCancelCurrentOrder = async () => {
    if (!pendingOrderId) return;
    if (await handleCancelOrder(pendingOrderId, cancelReason)) {
      setIsCancelConfirmOpen(false);
      setCancelReason("");
    }
  };

  const handleSelectPendingOrder = async (orderId: number) => {
    setIsLoadingPendingOrder(true);
    setIsActionPending(true);
    try {
      const res = await getOrderByIdAction(orderId);
      if (res.success && res.data) {
        const order: OrderDTO = res.data;
        let member = order.member ?? null;
        if (order.memberId) {
          const memberResult = await getMemberByIdAction(order.memberId);
          if (!memberResult.success || !("data" in memberResult) || !memberResult.data) {
            toast.error(memberResult.error || "Unable to load the customer linked to this order.");
            return;
          }
          member = memberResult.data;
        }
        setCartItems(pendingOrderToCartItems(order.orderItems));
        setSelectedMember(member);
        setSelectedMotorId(order.motorId);
        setPaymentMethod(order.paymentMethod || PaymentMethod.CASH);
        setQrConfirmedAmount(null);
        setReceivedAmount("");
        setPendingOrderId(order.id);
        setIsPendingSheetOpen(false);
      } else {
        toast.error("Failed to load order");
      }
    } finally {
      setIsActionPending(false);
      setIsLoadingPendingOrder(false);
    }
  };

  return (
    <>
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
              className="gap-2 cursor-pointer h-11 text-xs font-medium"
            >
              <Clock3 className="size-3.5 text-muted-foreground" />
              Pending
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Pending Orders</SheetTitle>
                <SheetDescription>Search recent held tickets to resume or cancel one.</SheetDescription>
              </SheetHeader>
              <div className="p-4">
                <PendingOrders onSelectOrder={handleSelectPendingOrder} onCancelOrder={handleCancelOrder} isSelecting={isLoadingPendingOrder} />
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
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-2"><span className="text-xs text-muted-foreground">Subtotal</span><span className="text-sm font-semibold text-foreground">฿{subtotal.toLocaleString()}</span></div>
              {discountAmount > 0 && <div className="flex items-baseline justify-end gap-2 text-xs text-emerald-700 dark:text-emerald-400"><span>Product discount ({appliedDiscountRate}%)</span><span>−฿{discountAmount.toLocaleString()}</span></div>}
              {productDiscountRate > 0 && <p className="text-xs text-muted-foreground">{selectedMember ? `Member discount: ${productDiscountRate}% on products` : `Product discount ${productDiscountRate}% is for members only`}</p>}
              <div className="flex items-baseline justify-end gap-2"><span className="text-xs font-medium text-muted-foreground">Total due</span><span className="text-lg font-bold text-foreground">฿{totalDue.toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        <PosPayment
          paymentMethod={paymentMethod}
          setPaymentMethod={(method) => { setPaymentMethod(method); setQrConfirmedAmount(null); }}
          receivedAmount={receivedAmount}
          setReceivedAmount={setReceivedAmount}
          subtotal={totalDue}
          changeAmount={changeAmount}
          isQrPaymentConfirmed={isQrPaymentConfirmed}
          isPaymentRequired={totalDue > 0}
          onQrPaymentConfirmationChange={(confirmed) => setQrConfirmedAmount(confirmed ? totalDue : null)}
        />

        <PosCartActions
          hasItems={hasItems}
          isPending={isActionPending}
          canComplete={canComplete}
          onHold={handleHoldOrder}
          onClear={handleClear}
          onComplete={handleCompleteSale}
          isEditingPending={Boolean(pendingOrderId)}
          onCancel={() => { setCancelReason(""); setIsCancelConfirmOpen(true); }}
        />
      </div>
    </aside>
    <Dialog open={isCancelConfirmOpen} onOpenChange={(open) => !isActionPending && setIsCancelConfirmOpen(open)}>
      <DialogContent data-pos-modal="true">
        <DialogHeader>
          <DialogTitle>Cancel pending order?</DialogTitle>
          <DialogDescription>This held ticket will be marked cancelled. This cannot be undone.</DialogDescription>
        </DialogHeader>
      <label className="mb-2 block text-sm font-medium" htmlFor="current-cancel-reason">Reason for cancellation</label>
      <select id="current-cancel-reason" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} className="mb-4 h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
        <option value="">Select a reason</option>
        {ORDER_CANCELLATION_REASONS.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
      </select>
        <DialogFooter>
        <Button type="button" variant="outline" disabled={isActionPending} onClick={() => { setIsCancelConfirmOpen(false); setCancelReason(""); }}>Keep order</Button>
        <Button type="button" variant="destructive" disabled={isActionPending || !cancelReason} onClick={handleCancelCurrentOrder}>
            {isActionPending ? "Cancelling…" : "Cancel order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <PosReceiptDialog receipt={receipt} onOpenChange={(open) => !open && setReceipt(null)} />
    </>
  );
};
